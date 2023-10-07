import type {GraphValue} from "../data/graph";

export interface ViewData {
    headers: RowHeader[]
    rows: Row[]
}

export interface RowHeader {
    name: string,
    description: string,
    key: string,
}

export interface Row {
    [key: string]: GraphValue
}
