import {defineInContext} from "../util";
import type {Extendable, ExtendableValue} from "./base";
import type {RelationshipSearcher} from "./relationship-searcher";
import type {NodeSearcher} from "./node-searcher";

/**
 * An abstraction of Neo4j.
 *
 * 1. Avoid the dependency of Neo4j.
 * 2. Impl for UT
 */
export interface Graph {
    getNode(id: string): Promise<GraphNode | null>

    getNodes(id: string[]): Promise<ExtendableValue<Record<string, GraphNode>>>

    searchNodes(searcher: NodeSearcher): Promise<ExtendableValue<GraphNode[]>>

    searchRelationships(searcher: RelationshipSearcher): Promise<ExtendableValue<GraphRelationship[]>>
}

export interface GraphMeta {
    getNodeMeta(type: string): Promise<GraphNodeMeta>

    getNodeTypes(): Promise<string[]>
}

export interface Cypher extends Graph {
    query(query: string, parameters?: Record<string, any>): Promise<CypherQueryResult>;
}

export const [getGraph, setGraph] = defineInContext<Graph>("Graph")
export const [getGraphMeta, setGraphMeta] = defineInContext<GraphMeta>("GraphMeta")
export const [getCypher, setCypher] = defineInContext<Cypher>("Cypher")

/**
 * Build root class for graph value
 */
export interface GraphPropertyValue extends Extendable {
    value: string
}

export interface GraphNode extends Extendable {
    id: string;
    type: string;
    properties: Record<string, GraphPropertyValue>;
}

export interface GraphRelationship extends Extendable {
    id: string;
    type: string;
    properties: Record<string, GraphPropertyValue>;
    startNodeId: string;
    endNodeId: string;
}

export type GraphValue = {
    type: "node",
    value: GraphNode,
} | {
    type: "relationship",
    value: GraphRelationship,
} | {
    type: "property",
    value: GraphPropertyValue,
}

export interface CypherQueryResult {
    keys: string[];
    records: Record<string, GraphValue>[];
}

export interface GraphPropertyMeta {
    key: string,
    required: boolean,
    show?: string,
}

export interface GraphNodeMeta {
    type: string,
    properties: GraphPropertyMeta[],
}
