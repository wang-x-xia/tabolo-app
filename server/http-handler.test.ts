import {afterAll, beforeAll, describe} from "vitest";
import {createHttpClient} from "../core"
import {verifyGraph} from "../core/test/graph-test.ts"
import {koaServer} from "./http-handler";
import {createFromLocalFs} from "./local-fs";

describe("HTTP Handler Test", async () => {
    beforeAll(async () => {
        const suite = await createFromLocalFs({
            path: "node_modules/.test",
            idPrefix: "test.",
        })
        const koa = koaServer(suite)
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
    const clientSuite = createHttpClient({baseUrl: "http://127.0.0.1:7777"})
    verifyGraph(clientSuite)
})