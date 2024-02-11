import type {GraphNode, GraphRelationship} from "./graph";
import type {GraphId} from "./graph-id.ts";

export interface GraphEdit {

    newEmptyNode(): Promise<GraphNode>

    editNodeType(id: GraphId, type: string): Promise<GraphNode>

    editNodeProperty(id: GraphId, properties: any): Promise<GraphNode>

    removeNode(id: GraphId): Promise<void>

    copyNode(id: GraphId): Promise<GraphNode>

    newEmptyRelationship(startNodeId: GraphId, endNodeId: GraphId): Promise<GraphRelationship>

    editRelationshipType(id: GraphId, type: string): Promise<GraphRelationship>

    editRelationshipStartNode(id: GraphId, nodeId: GraphId): Promise<GraphRelationship>

    editRelationshipEndNode(id: GraphId, nodeId: GraphId): Promise<GraphRelationship>

    editRelationshipProperty(id: GraphId, properties: any): Promise<GraphRelationship>

    removeRelationship(id: GraphId): Promise<void>

    copyRelationship(id: GraphId): Promise<GraphRelationship>
}
