import type {GraphNode, GraphPropertyValue} from "../data/graph";
import type {GraphEdit} from "./graph-edit";

export interface GraphPropertyEditHandler {
    key: string,
    mutable: boolean,
    required: boolean,
    value: string,
    dirty: boolean,

    save(): Promise<this>,

    remove(): Promise<this>,
}


export class GraphPropertyEditHandlerImpl implements GraphPropertyEditHandler {

    readonly key: string;
    readonly mutable: boolean;
    readonly required: boolean;
    private node: GraphNode;
    private origin: GraphPropertyValue | null;
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
