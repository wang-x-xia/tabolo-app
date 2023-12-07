import {defineInContext} from "../util";
import type {GraphNode} from "../data/graph";

export interface GraphEdit {

    editNodeProperty(id: string, properties: any): Promise<GraphNode>

    editNodeType(id: string, type: string): Promise<GraphNode>;

    newEmptyNode(): Promise<GraphNode>;

    removeNode(id: string): Promise<void>;

    copyNode(id: string): Promise<GraphNode>;
}

export const [getGraphEdit, setGraphEdit] = defineInContext<GraphEdit>("GraphEdit")
