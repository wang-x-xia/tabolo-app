export type PropertyViewData = JsonPathPropertyViewData

export interface JsonPathPropertyViewData {
    type: "JsonPath",
    name: string,
    jsonPath: string,
}
