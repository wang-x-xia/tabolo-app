import {afterAll, beforeAll, describe} from "vitest";
import {createHttpClientGraph, createHttpClientGraphEdit} from "tabolo-core"
import {verifyGraph} from "tabolo-core/lib/graph-test"
import {createFromLocalFs} from "./local-fs";
import {koaServer} from "./http-handler";

describe("HTTP Handler Test", async () => {
    beforeAll(async () => {
        const [graph, graphEdit] = await createFromLocalFs({
            path: "node_modules/.test",
            idPrefix: "test.",
        })
        const koa = koaServer(graph, graphEdit)
        const ready = new Promise(resolve => {
            const server = koa.listen(7777, () => {
                resolve(null)
            })
            afterAll(() => {
                server.close()
            })
        })
        await ready
    })
    const clientGraph = createHttpClientGraph({baseUrl: "http://127.0.0.1:7777/graph"})
    const clientGraphEdit = createHttpClientGraphEdit({baseUrl: "http://127.0.0.1:7777/graphEdit"})
    verifyGraph(clientGraph, clientGraphEdit)
})