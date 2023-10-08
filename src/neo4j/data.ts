import type {
    Cypher,
    CypherQueryResult,
    Graph,
    GraphMeta,
    GraphNode,
    GraphNodeLabelMeta,
    GraphPropertyMeta,
    GraphPropertyValue,
    GraphRelationship,
    GraphValue,
    Searcher
} from "../data/graph";
import type {Driver, Node, Record as Neo4jRecord, Relationship} from "neo4j-driver";
import {isNode, isRelationship} from "neo4j-driver";
import type {GraphEdit} from "../edit/graph-edit";
import type {GraphNodeEditHandler} from "../edit/node-edit";
import {GraphNodeEditHandlerImpl} from "../edit/node-edit";
import type {GraphPropertyEditHandler} from "../edit/property-edit";

const BLANK: GraphPropertyMeta = {
    key: "",
    required: true,
}

class Neo4jWrapper implements Graph, GraphEdit, GraphMeta, Cypher {

    private driver: Driver
    private labelMetaCache = new Map<string, Promise<GraphNodeLabelMeta>>()

    constructor(driver: Driver) {
        this.driver = driver;
    }

    async getNode(id: string): Promise<GraphNode | null> {
        return null;
    }

    async getNodes(id: string[]): Promise<Record<string, GraphNode>> {
        return {};
    }

    getLabel(label: string): Promise<GraphNodeLabelMeta> {
        if (!this.labelMetaCache.has(label)) {
            this.labelMetaCache.set(label, this._getLabel(label))
        }
        return this.labelMetaCache.get(label)
    }

    async _getLabel(label: string): Promise<GraphNodeLabelMeta> {
        const propertiesResult =
            await this.driver.executeQuery("CALL db.schema.nodeTypeProperties() " +
                "YIELD nodeLabels, propertyName, propertyTypes, mandatory " +
                "WHERE $label IN nodeLabels " +
                "RETURN propertyName, propertyTypes, mandatory",
                {label: label});
        const map = new Map<string, GraphPropertyMeta>()
        propertiesResult.records.forEach(it => {
            const name = it.get("propertyName")
            const original = map.has(name) ? map.get(name) : BLANK;
            map.set(name, {
                key: name,
                required: original.required && it.get("mandatory"),
            })
        })
        const properties = Array.from(map.values()).sort((l, r) =>
            l.key.localeCompare(r.key))
        const uniqueConstraintsResult =
            await this.driver.executeQuery("SHOW CONSTRAINTS " +
                'WHERE type = "UNIQUENESS" ' +
                "AND labelsOrTypes =[$label] " +
                'AND entityType = "NODE"',
                {label: label})
        const uniqueConstraints = uniqueConstraintsResult.records.map(it => {
            return it.get("properties") as string[]
        })
        return {
            label: label,
            properties: properties,
            uniqueConstraints: uniqueConstraints
        }
    }

    async getLabels(): Promise<string[]> {
        const labels = await this.driver.executeQuery("CALL db.labels")
        return labels.records.map(it => it.get("label"))
    }

    async searchNodes(searcher: Searcher): Promise<GraphNode[]> {
        switch (searcher.type) {
            case "null":
                const result = await this.query("MATCH (n) RETURN n");
                return result.records.map(it => (it["n"]).value as GraphNode)
        }
        return [];
    }

    async query(query: string, parameters?: Record<string, any>): Promise<CypherQueryResult> {
        const result = await this.driver.executeQuery(query, parameters);
        return {
            keys: result.keys,
            records: result.records.map(it => convertRecord(it))
        }
    }

    nodeEditHandler(node: GraphNode): GraphNodeEditHandler {
        return new GraphNodeEditHandlerImpl(node, this);
    }

    nodePropertyEditHandler(data: GraphNode, key: string, value: GraphPropertyValue | null): GraphPropertyEditHandler {
        if (value === null) {
            return {
                key,
                mutable: true,
                required: false,
                value: "",
            }
        } else {
            return {
                key,
                mutable: (value as Neo4jGraphPropertyValue).editStr,
                required: false,
                value: value.value,
            }
        }
    }

    async editNodeProperties(node: GraphNode, propertyHandlers: Record<string, GraphPropertyEditHandler>): Promise<GraphNode> {
        const old = Object.fromEntries(Object.entries(node.properties)
            .filter(([, value]) => (value as Neo4jGraphPropertyValue).editStr)
            .map(([key, value]) => [key, value.value])
        );
        const properties = Object.fromEntries(Object.entries(propertyHandlers)
            .filter(([, value]) => value.mutable)
            .map(([key, value]) => [key, value.value])
        );
        const result = await this.driver.executeQuery("MATCH (n) " +
            "WHERE elementId(n) = $id " +
            "AND properties(n) = $old " +
            "SET n += $properties " +
            "RETURN n", {
            id: node.id, old, properties,
        })
        if (result.records.length > 0) {
            return convertNode(result.records[0].get("n"))
        } else {
            console.log(result)
            throw new Error("Invalid result")
        }
    }

    async addLabelToNode(id: string, label: string): Promise<GraphNode> {
        const result = await this.driver.executeQuery("MATCH (n) " +
            "WHERE elementId(n) = $id " +
            "CALL apoc.create.addLabels(n, [$label]) " +
            "YIELD node " +
            "RETURN node as n", {
            id: id,
            label: label
        })
        if (result.records.length > 0) {
            return convertNode(result.records[0].get("n"))
        } else {
            console.log(result)
            throw new Error("Invalid result")
        }
    }
}

export function fromDriver(driver: Driver): Graph & GraphEdit & GraphMeta & Cypher {
    return new Neo4jWrapper(driver);
}

function convertRecord(record: Neo4jRecord): Record<string, GraphValue> {
    return Object.fromEntries(Object.entries(record.toObject()).map(([key, value]) => [key, convertValue(value)]))
}

function convertValue(value: any): GraphValue {
    // Map data types in Neo4j
    if (isNode(value)) {
        return {
            type: "node",
            value: convertNode(value),
        }
    } else if (isRelationship(value)) {
        return {
            type: "relationship",
            value: convertRelationship(value),
        }
    } else {
        return {
            type: "property",
            value: convertPropertyValue(value)
        }
    }
}


function convertProperties(record: Record<string, any>): Record<string, GraphPropertyValue> {
    return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, convertPropertyValue(value)]))
}

function convertPropertyValue(value: any): GraphPropertyValue {
    // Map data types in Neo4j
    if (isNode(value)) {
        return {
            value: "Node:" + value.elementId,
        }
    } else if (isRelationship(value)) {
        return {
            value: "Relationship:" + value.elementId,
        }
    } else {
        return {
            value: value.toString(),
            editStr: typeof value === "string",
        }
    }
}


function convertNode(node: Node): GraphNode {
    return {
        id: node.elementId,
        labels: node.labels,
        properties: convertProperties(node.properties),
    }
}


function convertRelationship(relationship: Relationship): GraphRelationship {
    return {
        id: relationship.elementId,
        type: relationship.type,
        properties: convertProperties(relationship.properties),
        startNodeId: relationship.startNodeElementId,
        endNodeId: relationship.endNodeElementId,
    }
}

interface Neo4jGraphPropertyValue extends GraphPropertyValue {
    // Mark the field is string, then can edit it
    editStr: boolean
}

/**
 * The neo4j type doesn't have a unified rule or wiki for that.
 * Use the source code to mapping them:
 * https://github.com/search?q=repo%3Aneo4j%2Fneo4j%20getTypeName&type=code
 */