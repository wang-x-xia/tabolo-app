import {defineInContext} from "../util";
import type {GraphNode, GraphPropertyValue} from "../data/graph";
import type {GraphNodeEditHandler} from "./node-edit";
import type {GraphPropertyEditHandler} from "./property-edit";

export interface GraphEdit {
    nodeEditHandler(node: GraphNode): GraphNodeEditHandler

    nodePropertyEditHandler(data: GraphNode, key: string, value: GraphPropertyValue | null): GraphPropertyEditHandler;

    editNodeProperty(id: string, key: string, value: GraphPropertyValue): Promise<GraphNode>

    removeNodeProperty(id: string, key: string): Promise<GraphNode>

    addLabelToNode(id: string, label: string): Promise<GraphNode>;

    removeLabelFromNode(id: string, label: string): Promise<GraphNode>;

    newEmptyNode(): Promise<GraphNode>;

    removeNode(id: string): Promise<void>;
}

export const [getGraphEdit, setGraphEdit] = defineInContext<GraphEdit>("GraphEdit")

