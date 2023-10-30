import type {GraphNode} from "../data/graph";
import type {GraphPropertyEditHandler} from "./property-edit";

export interface GraphNodeEditHandler {
    labels: string[];
    remains: string[];
    propertyHandlers: Record<string, GraphPropertyEditHandler>;

    addLabel(label: string): Promise<this>;

    removeLabel(label: string): Promise<this>;

    addProperty(newKey: string): Promise<this>;

    reset(node: GraphNode): Promise<this>;
}
