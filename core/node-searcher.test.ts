import {expect, test} from "vitest";
import type {GraphNode} from "./graph";
import {checkNode} from "./node-searcher";
import {alwaysTrueSearcher} from "./searcher";

const node: GraphNode = {
    id: "test",
    type: "type",
    properties: {
        key1: "1",
        key2: "2"
    }
}

test("Match Node with True Matcher", () => {
    expect(checkNode(node, alwaysTrueSearcher())).toBe(true);
})

test("Match Node with Eq Matcher", () => {
    expect(checkNode(node, {type: "eq", jsonPath: "$.key1", value: "1"})).toBe(true);
})

