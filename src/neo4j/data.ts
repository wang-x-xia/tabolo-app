import type {
    Cypher,
    CypherQueryResult,
    Graph,
    GraphMeta,
    GraphNode,
    GraphNodeLabelMeta,
    GraphPropertyMeta,
    GraphPropertyType,
    GraphRelationship
} from "../data/graph";
import {addTypeHint} from "../data/graph";
import type {Driver, EagerResult, Node, Record as Neo4jRecord, RecordShape, Relationship} from "neo4j-driver";
import {isInt, isNode, isRelationship, types} from "neo4j-driver";

const BLANK: GraphPropertyMeta = {
    key: "",
    required: true,
    types: []
}

class Neo4jWrapper implements Graph, GraphMeta, Cypher {

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
                types: uniqueTypes([
                    ...original.types,
                    ...convertTypes(it.get("propertyTypes"))])
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

    async searchNodes(): Promise<GraphNode[]> {
        return [];
    }

    async query(query: string, parameters: Record<string, any> | undefined): Promise<CypherQueryResult> {
        const result = await this.driver.executeQuery(query, parameters);
        return {
            keys: result.keys,
            records: result.records.map(it => convertRecord(it))
        }
    }

    async editNode(id: string, properties: Record<string, any>, old?: Record<string, any>): Promise<GraphNode> {
        let result: EagerResult<RecordShape>;
        if (old === undefined) {
            result = await this.driver.executeQuery("MATCH (n) " +
                "WHERE elementId(n) = $id " +
                "SET n += $properties " +
                "RETURN n", {
                id: id,
                properties: properties
            })
        } else {
            result = await this.driver.executeQuery("MATCH (n) " +
                "WHERE elementId(n) = $id " +
                "AND properties(n) = $old " +
                "SET n += $properties " +
                "RETURN n", {
                id: id,
                old: old,
                properties: properties
            })
        }
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

export function fromDriver(driver: Driver): Graph & GraphMeta & Cypher {
    return new Neo4jWrapper(driver);
}

function convertRecord(record: Neo4jRecord): Record<string, any> {
    return Object.fromEntries(Object.entries(record.toObject()).map(([key, value]) => [key, convertValue(value)]))
}

function convertValue(value: any): any {
    // Map data types in Neo4j
    if (isNode(value)) {
        return convertNode(value)
    } else if (isRelationship(value)) {
        return convertRelationship(value)
    } else if (isInt(value)) {
        if (value.inSafeRange()) {
            return value.toNumber()
        } else {
            return value.toBigInt()
        }
    } else if (typeof value === "string" || typeof value === "number" || value === null) {
        return value
    }

    // Assert not other types
    for (const type of Object.values(types)) {
        if (value instanceof (type as any)) {
            throw Error("Unsupported type in Tabolo!!!")
        }
    }

    if (Array.isArray(value)) {
        return value.map(v => convertValue(v))
    }
    return Object.fromEntries(Object.entries(value)
        .map(([key, value]) => [key, convertValue(value)]))
}

function convertNode(node: Node): GraphNode {
    return addTypeHint("node", {
        id: node.elementId,
        labels: node.labels,
        properties: convertValue(node.properties),
    })
}


function convertRelationship(relationship: Relationship): GraphRelationship {
    return addTypeHint("relationship", {
        id: relationship.elementId,
        type: relationship.type,
        properties: relationship.properties,
        startNodeId: relationship.startNodeElementId,
        endNodeId: relationship.endNodeElementId,
    })
}

function convertTypes(types: string[]): GraphPropertyType[] {
    return types.map(it => convertType(it))
}

function uniqueTypes(types: GraphPropertyType[]): GraphPropertyType[] {
    return Array.from(new Set(types)).sort()
}

/**
 * The neo4j type doesn't have a unified rule or wiki for that.
 * Use the source code to mapping them:
 * https://github.com/search?q=repo%3Aneo4j%2Fneo4j%20getTypeName&type=code
 */
function convertType(type: string): GraphPropertyType {
    if (type.endsWith("Array")) {
        return "list"
    }
    switch (type) {
        case "Integer":
        case "Long":
        case "Double":
        case "Float":
        case "Short":
            return "number";
        case "Boolean":
            return "boolean";
        case "List":
            return "list"
        case "Map":
            return "map"
        case "String":
            return "string"
    }
    throw Error(`Unsupported type ${type}`)
}