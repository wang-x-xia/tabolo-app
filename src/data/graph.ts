import {defineInContext} from "../util";

/**
 * An abstraction of Neo4j.
 *
 * 1. Avoid the dependency of Neo4j.
 * 2. Impl for UT
 */
export interface Graph {
    getNode(id: string): Promise<GraphNode | null>

    getNodes(id: string[]): Promise<Record<string, GraphNode>>

    searchNodes(): Promise<GraphNode[]>
}

export interface GraphMeta {
    getLabel(label: string): Promise<GraphNodeLabelMeta>
}

export interface Cypher extends Graph {
    query(query: string, parameters?: Record<string, any>): Promise<CypherQueryResult>;
}

export const [getGraph, setGraph] = defineInContext<Graph>("Graph")
export const [getGraphMeta, setGraphMeta] = defineInContext<GraphMeta>("GraphMeta")
export const [getCypher, setCypher] = defineInContext<Cypher>("Cypher")


export interface GraphPrimitiveType {
    boolean: boolean,
    string: string,
    number: number | bigint,
    null: null,
}

const typeHintSymbol = Symbol("GraphObjectType")

/**
 * List type will map to array which won't need type hint
 */
export interface GraphCompoundType1 {
    list: Array<any>,
}

/**
 * Map type will map to object which need type hint
 */
export interface GraphCompoundType2 {
    map: Record<string, any>,
}

export type GraphCompoundType = GraphCompoundType1 & GraphCompoundType2

export function getType(value: any): GraphType {
    if (value === null) {
        return "null";
    }
    switch (typeof value) {
        case "undefined":
            return "null";
        case "boolean":
            return "boolean"
        case "number":
        case "bigint":
            return "number";
        case "string":
            return "string";
    }
    if (Array.isArray(value)) {
        return "list"
    }
    if (Object.hasOwn(value, typeHintSymbol)) {
        return value[typeHintSymbol] as GraphType
    }
    return "map"
}

export interface GraphBuiltInType {
    node: GraphNode,
    relationship: GraphRelationship
}

export type GraphPropertyType = keyof GraphPrimitiveType | keyof GraphCompoundType

export type GraphType = keyof GraphPrimitiveType | keyof GraphCompoundType | keyof GraphBuiltInType

export type GraphNeedHintType = GraphCompoundType2 & GraphBuiltInType

export function addTypeHint<T extends keyof GraphNeedHintType>(type: T, data: GraphNeedHintType[T]): GraphNeedHintType[T] {
    return {
        [typeHintSymbol]: type,
        ...data
    } as GraphNeedHintType[T]
}

export function copyGraphData<T>(value: T): T {
    switch (getType(value)) {
        case "string":
        case "number":
        case "null":
        case "boolean":
            return value;
        case "list":
            return (value as Array<any>).map(it => copyGraphData(it)) as T;
        case "map":
            const copiedMap = Object.fromEntries(Object.entries(value)
                .map(([key, value]) => ([key, copyGraphData(value)]))) as T;
            if (Object.hasOwn(value as Record<string, any>, typeHintSymbol)) {
                copiedMap[typeHintSymbol] = "map"
            }
            return copiedMap;
        case "node":
            return copyGraphNode(value as GraphNode) as T;
        case "relationship":
            return copyRelationship(value as GraphRelationship) as T;
    }
    throw new Error(`Unknown value for copy ${value}`);
}


export interface GraphNode {
    id: string;
    labels: string[];
    properties: Record<string, any>;
}

export function copyGraphNode(value: GraphNode): GraphNode {
    return addTypeHint("node", {
        id: value.id,
        labels: [...value.labels],
        properties: copyGraphData(value.properties)
    })
}

export interface GraphRelationship {
    id: string;
    type: string;
    properties: Record<string, any>;
    startNodeId: string;
    endNodeId: string;
}


export function copyRelationship(value: GraphRelationship): GraphRelationship {
    return addTypeHint("relationship", {
        id: value.id,
        type: value.type,
        properties: copyGraphData(value.properties),
        startNodeId: value.startNodeId,
        endNodeId: value.endNodeId,
    })
}

export interface CypherQueryResult {
    keys: string[];
    records: Record<string, any>[];
}

export interface GraphPropertyMeta {
    key: string,
    required: boolean,
    types: GraphType[]
}

export interface GraphNodeLabelMeta {
    label: string,
    properties: GraphPropertyMeta[],
    uniqueConstraints: string[][]
}