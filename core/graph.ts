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

export interface GraphResource extends Extendable {
    id: GraphId
    type: string
    properties: any
}

export interface GraphNode extends GraphResource {
}

export interface GraphRelationship extends GraphResource {
    startNodeId: GraphId;
    endNodeId: GraphId;
}

export interface GraphNodeCellMeta {
    showJsonPath?: string | null,
}

export function defaultGraphNodeCellMeta(): GraphNodeCellMeta {
    return {}
}

export interface GraphResourceDetailsMeta {
    typeEditable: boolean
    propertiesEditable: boolean
    copiable: boolean
}

export interface GraphNodeDetailsMeta extends GraphResourceDetailsMeta {
    markdownJsonPath?: string
}

export function defaultGraphNodeDetailsMeta(): GraphResourceDetailsMeta {
    return {
        typeEditable: true,
        propertiesEditable: true,
        copiable: true,
    }
}