import {describe} from "vitest";
import {verifyGraph} from "../../core/graph-test"
import {createLocalStorage} from "./local-storage-graph-source";

describe("Local Storage Graph Source Test", async () => {
    const [graph, graphEdit] = createLocalStorage({name: "test"})
    verifyGraph(graph, graphEdit)
})