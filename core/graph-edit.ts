import type {GraphNode, GraphRelationship} from "./graph";
import type {GraphId} from "./graph-id.ts";

/**
 * For Graph Edit, only type and properties are allowed
 */
export type GraphNodeBody = Pick<GraphNode, "type" | "properties">

/**
 * For Graph Edit, only type, properties and node ids are allowed
 */
export type GraphRelationshipBody = Pick<GraphRelationship, "type" | "properties" | "startNodeId" | "endNodeId">

export interface GraphEdit {

    createNode(node: GraphNodeBody): Promise<GraphNode>

    editNode(id: GraphId, node: Partial<GraphNodeBody>): Promise<GraphNode>

    removeNode(id: GraphId): Promise<void>

    createRelationship(relationship: GraphRelationshipBody): Promise<GraphRelationship>

    editRelationship(id: GraphId, relationship: Partial<GraphRelationshipBody>): Promise<GraphRelationship>

    removeRelationship(id: GraphId): Promise<void>
}
