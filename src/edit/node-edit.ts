import type {GraphNode} from "../data/graph";
import type {GraphPropertyEditHandler} from "./property-edit";

export interface GraphNodeEditHandler {
    remains: string[];
    propertyHandlers: Record<string, GraphPropertyEditHandler>;

    setType(type: string): Promise<this>;

    addProperty(newKey: string): Promise<this>;

    reset(node: GraphNode): Promise<this>;
}
