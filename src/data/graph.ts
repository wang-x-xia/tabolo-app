import {defineInContext} from "../util";
import type {Extendable} from "./base";
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

    getNodes(id: string[]): Promise<Record<string, GraphNode>>

    searchNodes(searcher: NodeSearcher): Promise<GraphNode[]>

    searchRelationships(searcher: RelationshipSearcher): Promise<GraphRelationship[]>
}

export interface GraphMeta {
    getNodeMeta(type: string): Promise<GraphNodeMeta>

    getNodeTypes(): Promise<string[]>
}

export const [getGraph, setGraph] = defineInContext<Graph>("Graph")
export const [getGraphMeta, setGraphMeta] = defineInContext<GraphMeta>("GraphMeta")

export interface GraphNode extends Extendable {
    id: string;
    type: string;
    properties: any;
}

export interface GraphRelationship extends Extendable {
    id: string;
    type: string;
    properties: any;
    startNodeId: string;
    endNodeId: string;
}


export interface GraphNodeMeta {
    name: string,
    showJsonPath?: string | null,
}
