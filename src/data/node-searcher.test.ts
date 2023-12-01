import {expect, test} from "vitest";
import type {GraphNode} from "./graph";
import {checkNode} from "./node-searcher";
import {emptySearcher} from "./searcher";

const node: GraphNode = {
    id: "test",
    type: "type",
    properties: {
        key1: {
            value: "1"
        },
        key2: {
            value: "2"
        }
    }
}

test("Match Node with Null Matcher", () => {
    expect(checkNode(node, emptySearcher())).toBe(true);
})