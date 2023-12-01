import {defineInContext} from "../util";
import type {GraphNode, GraphPropertyValue} from "../data/graph";
import type {GraphNodeEditHandler} from "./node-edit";
import type {GraphPropertyEditHandler} from "./property-edit";

export interface GraphEdit {

    editNodeProperty(id: string, key: string, value: GraphPropertyValue): Promise<GraphNode>

    removeNodeProperty(id: string, key: string): Promise<GraphNode>

    editNodeType(id: string, type: string): Promise<GraphNode>;

    newEmptyNode(): Promise<GraphNode>;

    removeNode(id: string): Promise<void>;

    copyNode(id: string): Promise<GraphNode>;
}

export interface GraphEditHandler {
    node(node: GraphNode, edit: GraphEdit): GraphNodeEditHandler

    nodeProperty(data: GraphNode, key: string, value: GraphPropertyValue | null, edit: GraphEdit): GraphPropertyEditHandler;
}

export const [getGraphEdit, setGraphEdit] = defineInContext<GraphEdit>("GraphEdit")

export const [getGraphEditHandler, setGraphEditHandler] = defineInContext<GraphEditHandler>("GraphEditHandler")
