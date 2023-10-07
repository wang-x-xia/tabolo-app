import type {GraphNode} from "../data/graph";
import type {GraphPropertyEditHandler} from "./property-edit";
import type {GraphEdit} from "./graph-edit";

export interface GraphNodeEditHandler {
    labels: string[];
    remains: string[];
    propertyHandlers: Record<string, GraphPropertyEditHandler>;

    addLabel(label: string): Promise<this>;

    addProperty(newKey: string): Promise<this>;

    save(): Promise<this>

    reset(): Promise<this>;
}

export class GraphNodeEditHandlerImpl implements GraphNodeEditHandler {

    labels: string[];
    propertyHandlers: Record<string, GraphPropertyEditHandler>;
    remains: string[];
    private data: GraphNode;
    private edit: GraphEdit;

    constructor(data: GraphNode, edit: GraphEdit) {
        this.data = data
        this.edit = edit
        this._reset()
    }

    async addLabel(label: string): Promise<this> {
        if (label in this.labels) {
            return
        }
        this.data = await this.edit.addLabelToNode(this.data.id, label)
        return this
    }

    async addProperty(newKey: string): Promise<this> {
        if (this.propertyHandlers[newKey] === undefined) {
            this.propertyHandlers = {
                [newKey]: this.edit.nodePropertyEditHandler(this.data, newKey, null),
                ...this.propertyHandlers,
            }
            this.remains = [...this.remains, newKey]
        }
        return this
    }

    async reset(): Promise<this> {
        this._reset()
        return this
    }

    _reset() {
        this.labels = [...this.data.labels]
        this.remains = Object.keys(this.data.properties)
        this.propertyHandlers = Object.fromEntries(Object.entries(this.data.properties).map(([key, value]) =>
            [key, this.edit.nodePropertyEditHandler(this.data, key, value)]))
    }

    async save(): Promise<this> {
        this.data = await this.edit.editNodeProperties(this.data, this.propertyHandlers)
        this._reset()
        return this
    }
}
