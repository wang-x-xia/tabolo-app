import {verifyGraph} from "tabolo-core/lib/graph-test"
import {describe} from "vitest";
import {createLocalStorage} from "./local-storage-graph-source";

describe("Local Storage Graph Source Test", async () => {
    const [graph, graphEdit] = createLocalStorage({name: "test"})
    verifyGraph(graph, graphEdit)
})