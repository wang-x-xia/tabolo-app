import type {EmptySearcher, MatchAllSearcher, TypeSearcher} from "./searcher";
import type {GraphNode} from "./graph";
import {JSONPath} from "jsonpath-plus";


export interface PropertySearcher {
    type: "eq",
    jsonPath: string,
    value: any,
}

export type NodeSearcher = EmptySearcher | TypeSearcher | PropertySearcher | MatchAllSearcher<NodeSearcher>

export function checkNode(node: GraphNode, searcher: NodeSearcher): boolean {
    switch (searcher.type) {
        case "type":
            return node.type === searcher.value;
        case "eq":
            const path = searcher.jsonPath
            const value = JSON.stringify(JSONPath({
                path,
                json: node.properties,
                wrap: false
            }))
            return value === JSON.stringify(searcher.value)
        case "and":
            return searcher.searchers.every(s => checkNode(node, s))
        case "empty":
            return true;
    }
}
