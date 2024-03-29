import {describe, expect, test} from "vitest"
import {emptySearcher, typeSearcher} from "../core"
import {verifyGraph} from "../core/test/graph-test.ts"
import {collectSearcherTypes, createFromLocalFs} from "./local-fs"

test("Collect Searcher Types", () => {
    expect(collectSearcherTypes(emptySearcher())).toBe(null)
    expect(collectSearcherTypes(typeSearcher("type1"))).toStrictEqual(["type1"])
    expect(collectSearcherTypes({
        type: "and",
        searchers: [emptySearcher(), typeSearcher("type1")]
    })).toStrictEqual(["type1"])
    expect(collectSearcherTypes({
        type: "and",
        searchers: [emptySearcher(), typeSearcher("type1"), typeSearcher("type2")]
    })).toStrictEqual([])
})


describe("Local FS Test", async () => {
    const suite = await createFromLocalFs({
        path: "node_modules/.test",
        idPrefix: "test.",
    })
    verifyGraph(suite)
})