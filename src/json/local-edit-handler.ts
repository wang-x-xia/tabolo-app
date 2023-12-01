import type {GraphNode, GraphPropertyValue} from "../data/graph";
import type {GraphNodeEditHandler} from "../edit/node-edit";
import type {GraphPropertyEditHandler} from "../edit/property-edit";
import type {GraphEdit, GraphEditHandler} from "../edit/graph-edit";

export function createEditHandler(): GraphEditHandler {
    return {
        node,
        nodeProperty
    }
}

function nodeProperty(data: GraphNode, key: string, value: GraphPropertyValue | null, edit: GraphEdit): GraphPropertyEditHandler {
    return new GraphPropertyEditHandlerImpl(data, key, value, true, true, edit);
}

function node(node: GraphNode, edit: GraphEdit): GraphNodeEditHandler {
    return new GraphNodeEditHandlerImpl(node, edit);
}


export class GraphNodeEditHandlerImpl implements GraphNodeEditHandler {

    propertyHandlers: Record<string, GraphPropertyEditHandler>;
    remains: string[];
    private data: GraphNode;
    private edit: GraphEdit;

    constructor(data: GraphNode, edit: GraphEdit) {
        this.data = data
        this.edit = edit
        this._reset()
    }

    async setType(type: string): Promise<this> {
        this.data = await this.edit.editNodeType(this.data.id, type)
        return this
    }

    async addProperty(newKey: string): Promise<this> {
        if (this.propertyHandlers[newKey] === undefined) {
            this.propertyHandlers = {
                [newKey]: nodeProperty(this.data, newKey, null, this.edit),
                ...this.propertyHandlers,
            }
            this.remains = [...this.remains, newKey]
        }
        return this
    }

    async reset(node: GraphNode): Promise<this> {
        this.data = node;
        this._reset()
        return this
    }

    _reset() {
        this.remains = Object.keys(this.data.properties).sort();
        this.propertyHandlers = Object.fromEntries(Object.entries(this.data.properties).map(([key, value]) =>
            [key, nodeProperty(this.data, key, value, this.edit)]))
    }
}

export class GraphPropertyEditHandlerImpl implements GraphPropertyEditHandler {

    readonly key: string;
    readonly mutable: boolean;
    readonly required: boolean;
    readonly origin: GraphPropertyValue | null;
    private node: GraphNode;
    private edit: GraphEdit;

    constructor(data: GraphNode, key: string, value: GraphPropertyValue | null,
                mutable: boolean, required: boolean,
                edit: GraphEdit) {
        this.node = data;
        this.key = key;
        this.mutable = mutable;
        this.required = required;
        this.origin = value;
        this.edit = edit;

        this._value = value == null ? "" : value.value;
    }

    private _value: string;

    get value() {
        return this._value;
    }

    set value(v: string) {
        this._value = v;
    }

    get dirty() {
        if (this.origin == null) {
            return !!this._value
        } else {
            return this._value != this.origin.value;
        }
    }

    async save() {
        await this.edit.editNodeProperty(this.node.id, this.key, {
            value: this._value
        });
        return this;
    }

    async remove() {
        await this.edit.removeNodeProperty(this.node.id, this.key);
        return this;
    }
}
