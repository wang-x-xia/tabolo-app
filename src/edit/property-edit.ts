import type {GraphPropertyValue} from "../data/graph";

export interface GraphPropertyEditHandler {
    key: string,
    mutable: boolean,
    required: boolean,
    value: string,
    dirty: boolean,
    origin: GraphPropertyValue | null,

    save(): Promise<this>,

    remove(): Promise<this>,
}

