import {defineInContext} from "../util";
import type {GraphNode, GraphRelationship} from "../data/graph";

export interface GraphEdit {

    newEmptyNode(): Promise<GraphNode>;

    editNodeType(id: string, type: string): Promise<GraphNode>;

    editNodeProperty(id: string, properties: any): Promise<GraphNode>

    removeNode(id: string): Promise<void>;

    copyNode(id: string): Promise<GraphNode>;

    newEmptyRelationship(startNodeId: string, endNodeId: string): Promise<GraphRelationship>

    editRelationshipType(id: string, nodeId: string): Promise<GraphRelationship>

    editRelationshipStartNode(id: string, nodeId: string): Promise<GraphRelationship>

    editRelationshipEndNode(id: string, nodeId: string): Promise<GraphRelationship>

    editRelationshipProperty(id: string, properties: any): Promise<GraphRelationship>

    removeRelationship(id: string): Promise<void>;

    copyRelationship(id: string): Promise<GraphRelationship>;
}

export const [getGraphEdit, setGraphEdit] = defineInContext<GraphEdit>("GraphEdit")
