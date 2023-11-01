import type {EmptySearcher} from "./searcher";
import type {GraphNode, GraphPropertyValue} from "./graph";


export interface LabelSearcher {
    type: "label",
    label: string
}

export interface PropertySearcher {
    type: "eq",
    key: string,
    value: GraphPropertyValue,
}

export interface MatchAllSearcher {
    type: "and",
    searchers: NodeSearcher[],
}


export type NodeSearcher = EmptySearcher | LabelSearcher | PropertySearcher | MatchAllSearcher

export function checkNode(node: GraphNode, searcher: NodeSearcher): boolean {
    switch (searcher.type) {
        case "label":
            return node.labels.includes(searcher.label);
        case "eq":
            const key = searcher.key
            return key in node.properties && node.properties[key].value == searcher.value.value
        case "and":
            return searcher.searchers.every(s => checkNode(node, s))
        case "empty":
            return true;
    }
}
