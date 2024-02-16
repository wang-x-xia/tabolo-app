import type {GraphNode} from "./graph";
import {
    checkGraphResource,
    type GraphResourceCommonSearcher,
    type MatchAllSearcher,
    type MatchAnySearcher,
    type NotSearcher
} from "./searcher";

export type NodeSearcher =
    GraphResourceCommonSearcher |
    // GraphResourceLogicSearcher will cause circuit reference issue
    MatchAllSearcher<NodeSearcher> |
    MatchAnySearcher<NodeSearcher> |
    NotSearcher<NodeSearcher>

function checkNodeInternal(_: GraphNode, searcher: NodeSearcher): boolean {
    throw new Error(`Invalid searcher ${JSON.stringify(searcher)}`)
}

export function checkNode(node: GraphNode, searcher: NodeSearcher): boolean {
    return checkGraphResource(node, searcher, checkNodeInternal)
}
