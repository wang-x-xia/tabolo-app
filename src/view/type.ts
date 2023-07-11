export interface ViewData {
    headers: RowHeader[]
    rows: Row[]
}

export interface RowHeader {
    name: string,
    description: string,
    key: string,
    type: "node"
}

export interface Row {
    [key: string]: any
}
