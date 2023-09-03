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

    isNode(value: any): value is GraphNode

    isRelationship(value: any): value is GraphRelationship
}

export interface Cypher extends Graph {
    query(query: string, parameters?: Record<string, any>): Promise<CypherQueryResult>;
}

export const [getGraph, setGraph] = defineInContext<Graph>("Graph")
export const [getCypher, setCypher] = defineInContext<Cypher>("Cypher")

export interface GraphNode {
    id: string;
    labels: string[];
    properties: Record<string, any>;
}

export interface GraphRelationship {
    id: string;
    type: string;
    properties: Record<string, any>;
    startNodeId: string;
    endNodeId: string;
}

export interface CypherQueryResult {
    keys: string[];
    records: Record<string, any>[];
}