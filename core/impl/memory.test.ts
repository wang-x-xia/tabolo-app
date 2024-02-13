import {describe} from "vitest";
import {verifyGraph} from "../test/graph-test.ts"
import {createDefaultMemoryHandler, createMemoryGraph} from "./memory.ts";

describe("Local Storage Graph Source Test", async () => {
    const suite = createMemoryGraph({handler: createDefaultMemoryHandler()})
    verifyGraph(suite)
})