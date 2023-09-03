import type {Cypher, CypherQueryResult, Graph, GraphNode, GraphRelationship} from "../data/graph";
import type {Driver, Node, Record as Neo4jRecord, Relationship} from "neo4j-driver";
import {isInt, isNode, isRelationship, types} from "neo4j-driver";


export function fromDriver(driver: Driver): Graph & Cypher {
    return {
        async getNode(id: string): Promise<GraphNode | null> {
            return null;
        },

        async getNodes(id: string[]): Promise<Record<string, GraphNode>> {
            return {};
        },

        isNode(value: any): value is GraphNode {
            return Object.hasOwn(value, internalValueKey) && isNode(value[internalValueKey])
        },

        isRelationship(value: any): value is GraphRelationship {
            return Object.hasOwn(value, internalValueKey) && isRelationship(value[internalValueKey])
        },

        async searchNodes(): Promise<GraphNode[]> {
            return [];
        },

        async query(query: string, parameters: Record<string, any> | undefined): Promise<CypherQueryResult> {
            const result = await driver.executeQuery(query, parameters);
            return {
                keys: result.keys,
                records: result.records.map(it => convertRecord(it))
            }
        },
    }
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
    if (typeof value === "object") {
        return Object.fromEntries(Object.entries(value)
            .map(([key, value]) => [key, convertValue(value)]))
    }
    return value
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