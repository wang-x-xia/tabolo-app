import type {
    Cypher,
    CypherQueryResult,
    Graph,
    GraphMeta,
    GraphNode,
    GraphNodeLabelMeta,
    GraphPropertyMeta,
    GraphRelationship
} from "../data/graph";
import type {Driver, Node, Record as Neo4jRecord, Relationship} from "neo4j-driver";
import {isInt, isNode, isRelationship, types} from "neo4j-driver";


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

    isNode(value: any): value is GraphNode {
        return Object.hasOwn(value, internalValueKey) && isNode(value[internalValueKey])
    }

    isRelationship(value: any): value is GraphRelationship {
        return Object.hasOwn(value, internalValueKey) && isRelationship(value[internalValueKey])
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
        const properties = propertiesResult.records.map<GraphPropertyMeta>(it => {
            return {
                key: it.get("propertyName"),
                name: null,
                description: null,
                required: it.get("mandatory"),
                priority: null,
                types: it.get("propertyTypes")
            }
        })
        const uniqueConstraintsResult =
            await this.driver.executeQuery("SHOW CONSTRAINTS " +
                'WHERE type = "UNIQUENESS" ' +
                "AND labelsOrTypes =[$label] " +
                'AND entityType = "NODE"',
                {label: label})
        const uniqueConstraints = uniqueConstraintsResult.records.map(it => {
            return it.get("properties") as string[]
        })
        console.log({
            label: label,
            name: null,
            properties: properties,
            uniqueConstraints: uniqueConstraints
        })
        return {
            label: label,
            name: null,
            properties: properties,
            uniqueConstraints: uniqueConstraints
        }
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
}

export function fromDriver(driver: Driver): Graph & GraphMeta & Cypher {
    return new Neo4jWrapper(driver);
}

const internalValueKey = Symbol("neo4j")

interface WithNeo4j {
    [internalValueKey]: any
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
    } else if (typeof value === "string" || value === null) {
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

function convertNode(node: Node): WithNeo4j & GraphNode {
    return {
        [internalValueKey]: node,
        id: node.elementId,
        labels: node.labels,
        properties: node.properties,
    }
}


function convertRelationship(relationship: Relationship): WithNeo4j & GraphRelationship {
    return {
        [internalValueKey]: relationship,
        id: relationship.elementId,
        type: relationship.type,
        properties: relationship.properties,
        startNodeId: relationship.startNodeElementId,
        endNodeId: relationship.endNodeElementId,
    }
}