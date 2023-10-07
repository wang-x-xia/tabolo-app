import {defineInContext} from "../util";
import type {GraphNode, GraphPropertyValue} from "../data/graph";
import type {GraphNodeEditHandler} from "./node-edit";
import type {GraphPropertyEditHandler} from "./property-edit";

export interface GraphEdit {
    nodeEditHandler(node: GraphNode): GraphNodeEditHandler

    nodePropertyEditHandler(data: GraphNode, key: string, value: GraphPropertyValue | null): GraphPropertyEditHandler;

    editNodeProperties(node: GraphNode, propertyHandlers: Record<string, GraphPropertyEditHandler>): Promise<GraphNode>

    addLabelToNode(id: string, label: string): Promise<GraphNode>;
}

export const [getGraphEdit, setGraphEdit] = defineInContext<GraphEdit>("GraphEdit")

