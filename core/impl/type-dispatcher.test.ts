import {describe} from "vitest";
import {verifyGraph} from "../test/graph-test.ts";
import {createDefaultMemoryHandler, createMemoryGraph} from "./memory.ts";
import {createTypeDispatcher} from "./type-dispatcher.ts";

describe("Type Dispatcher Graph Source Test", async () => {
    const suite = createTypeDispatcher({
        suites: {
            "Suite 1": createMemoryGraph({handler: createDefaultMemoryHandler()}),
            "Suite 2": createMemoryGraph({handler: createDefaultMemoryHandler()}),
        },
        nodeTypes: {
            "Type": "Suite 1",
            "Type 1": "Suite 1",
            "Type 2": "Suite 1",
        },
        relationshipTypes: {
            "Type 1": "Suite 1",
            "Type 2": "Suite 1",
        }
    })
    verifyGraph(suite)
})