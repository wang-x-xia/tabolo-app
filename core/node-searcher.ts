import {JSONPath} from "jsonpath-plus";
import type {GraphNode} from "./graph";
import {
    emptySearcher,
    type EmptySearcher,
    matchAllSearcher,
    type MatchAllSearcher,
    type PropertySearcher,
    type TypeSearcher
} from "./searcher";

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

