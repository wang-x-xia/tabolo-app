import type {Extendable} from "./base";
import type {GraphId} from "./graph-id";
import type {NodeSearcher} from "./node-searcher";
import type {RelationshipSearcher} from "./relationship-searcher";

/**
 * An abstraction of Neo4j.
 *
 * 1. Avoid the dependency of Neo4j.
 * 2. Impl for UT
 */
export interface Graph {
    getNode(id: GraphId): Promise<GraphNode | null>

    searchNodes(searcher: NodeSearcher): Promise<GraphNode[]>

    getRelationship(id: GraphId): Promise<GraphRelationship | null>

    searchRelationships(searcher: RelationshipSearcher): Promise<GraphRelationship[]>
}

export interface GraphMeta {
    getNodeMeta(type: string): Promise<GraphNodeMeta>

    getNodeEditMeta(type: string): Promise<GraphNodeEditMeta>

    getNodeTypes(): Promise<string[]>

    getRelationshipTypes(): Promise<string[]>
}

export interface GraphNode extends Extendable {
    id: GraphId;
    type: string;
    properties: any;
}

export interface GraphRelationship extends Extendable {
    id: GraphId;
    type: string;
    properties: any;
    startNodeId: GraphId;
    endNodeId: GraphId;
}


export interface GraphNodeMeta {
    name: string,
    showJsonPath?: string | null,
}

export interface GraphNodeEditMeta {
    markdownJsonPath?: string
}