import type {PluginOption} from "vite";
import {koaServer} from "./http-handler";
import {createFromLocalFs} from "./local-fs";


export function devGraph(): PluginOption {
    return {
        name: "Dev-Graph",
        configureServer(server) {
            const middlewareAsync = async function asyncLoad() {
                const suite = await createFromLocalFs({
                    path: "./tabolo",
                    idPrefix: "",
                })
                const koa = koaServer(suite)
                return koa.callback()
            }()
            return () => server.middlewares.use("/dev-graph", async (req, res) => {
                const middleware = await middlewareAsync
                await middleware(req, res)
            })
        },
    }
}
