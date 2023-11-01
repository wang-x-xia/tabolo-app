import {expect, test} from "vitest";
import type {GraphNode} from "./graph";
import {checkNode} from "./graph";

const node: GraphNode = {
    id: "test",
    labels: ["test1", "test2"],
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
    expect(checkNode(node, {type: "null", value: {}})).toBe(true);
})