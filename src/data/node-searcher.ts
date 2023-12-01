import type {EmptySearcher, TypeSearcher} from "./searcher";
import type {GraphNode, GraphPropertyValue} from "./graph";


export interface PropertySearcher {
    type: "eq",
    key: string,
    value: GraphPropertyValue,
}

export interface MatchAllSearcher {
    type: "and",
    searchers: NodeSearcher[],
}


export type NodeSearcher = EmptySearcher | TypeSearcher | PropertySearcher | MatchAllSearcher

export function checkNode(node: GraphNode, searcher: NodeSearcher): boolean {
    switch (searcher.type) {
        case "type":
            return node.type === searcher.value;
        case "eq":
            const key = searcher.key
            return key in node.properties && node.properties[key].value == searcher.value.value
        case "and":
            return searcher.searchers.every(s => checkNode(node, s))
        case "empty":
            return true;
    }
}
