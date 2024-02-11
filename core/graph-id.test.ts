import {expect, test} from "vitest";
import {displayGraphId, isSameGraphId} from "./graph-id.ts";

test("Graph ID Equals", () => {
    expect(isSameGraphId("1", "1")).toBeTruthy();
    expect(isSameGraphId(1, "1"), "Different Type").toBeFalsy();
    expect(isSameGraphId({"id": 1}, {"id": 1}), "Same JSON").toBeTruthy();
})

test("Graph ID display", () => {
    expect(displayGraphId("id")).toBe("id");
    expect(displayGraphId({id: "id"})).toBe('{"id":"id"}');
})
