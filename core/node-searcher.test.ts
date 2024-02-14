import {expect, test} from "vitest";
import type {GraphNode} from "./graph";
import {checkNode, type NodeSearchersByType, separateNodeSearcherByTypes} from "./node-searcher";
import {emptySearcher, matchAllSearcher, propertySearcher, typeSearcher} from "./searcher";

const node: GraphNode = {
    id: "test",
    type: "type",
    properties: {
        key1: "1",
        key2: "2"
    }
}

test("Match Node with Null Matcher", () => {
    expect(checkNode(node, emptySearcher())).toBe(true);
})

test("Match Node with Eq Matcher", () => {
    expect(checkNode(node, {type: "eq", jsonPath: "$.key1", value: "1"})).toBe(true);
})


test("Separate Node Searcher By Types", () => {
    expect(separateNodeSearcherByTypes(emptySearcher()), "Simple all types")
        .toStrictEqual<NodeSearchersByType>({
            type: "AllTypes",
            data: emptySearcher(),
        })
    expect(separateNodeSearcherByTypes(typeSearcher("Type1")), "Simple one type")
        .toStrictEqual<NodeSearchersByType>({
            type: "ByType",
            data: {"Type1": emptySearcher()},
        })
    expect(separateNodeSearcherByTypes(matchAllSearcher([typeSearcher("Type1"), typeSearcher("Type2")])),
        "No type")
        .toStrictEqual<NodeSearchersByType>({
            type: "ByType",
            data: {},
        })
    expect(separateNodeSearcherByTypes(matchAllSearcher([
            typeSearcher("Type1"),
            propertySearcher("$.x", "1"),
        ])),
        "Mix searcher")
        .toStrictEqual<NodeSearchersByType>({
            type: "ByType",
            data: {
                "Type1": matchAllSearcher([
                    emptySearcher(),
                    propertySearcher("$.x", "1"),
                ])
            },
        })
    expect(separateNodeSearcherByTypes(matchAllSearcher([
            typeSearcher("Type1"),
            matchAllSearcher([
                typeSearcher("Type1"),
                propertySearcher("$.x", "1"),
            ]),
        ])),
        "Cascade searcher")
        .toStrictEqual<NodeSearchersByType>({
            type: "ByType",
            data: {
                "Type1": matchAllSearcher([
                    emptySearcher(),
                    matchAllSearcher([
                        emptySearcher(),
                        propertySearcher("$.x", "1"),
                    ]),
                ]),
            },
        })
})