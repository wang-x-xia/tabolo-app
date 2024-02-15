import type {GraphNode} from "./graph";
import {
    checkGraphResource,
    emptySearcher,
    type GraphResourceCommonSearcher,
    matchAllSearcher,
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

export type NodeSearchersByType = {
    type: "AllTypes",
    data: NodeSearcher,
} | {
    type: "ByType",
    data: Record<string, NodeSearcher>
}

export function separateNodeSearcherByTypes(searcher: NodeSearcher): NodeSearchersByType {
    switch (searcher.type) {
        case "type":
            return {type: "ByType", data: {[searcher.value]: emptySearcher()}}
        case "and":
            const result = searcher.searchers.map(it => separateNodeSearcherByTypes(it))
            if (result.every(it => it.type === "AllTypes")) {
                return {type: "AllTypes", data: searcher,}
            }
            let types: string[] | null = null
            for (const item of result) {
                switch (item.type) {
                    default:
                        break
                    case "ByType": {
                        const supportedTypes = Object.keys(item.data)
                        if (types === null) {
                            types = supportedTypes
                        } else {
                            types = types.filter(it => supportedTypes.includes(it))
                        }
                    }
                }
            }
            if (types === null) {
                throw new Error("Assertion Error")
            }
            const data: Record<string, NodeSearcher[]> = {}
            types.forEach(t => data[t] = [])
            for (const item of result) {
                switch (item.type) {
                    default:
                    case "AllTypes": {
                        types.forEach(t => data[t].push(item.data))
                        break
                    }
                    case "ByType": {
                        types.forEach(t => data[t].push(item.data[t]))
                    }
                }
            }
            return {
                type: "ByType",
                data: Object.fromEntries(Object.entries(data).map(([type, searchers]) =>
                    [type, matchAllSearcher(searchers)]))
            }
        default:
            return {type: "AllTypes", data: searcher,}
    }
}

