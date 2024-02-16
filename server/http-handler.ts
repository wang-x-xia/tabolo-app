import Router from "@koa/router";
import Koa from "koa";
import {koaBody} from "koa-body"
import {Graph, GraphEdit, type GraphMeta, type GraphSuite} from "../core"

export function koaServer({graph, edit, meta}: GraphSuite): Koa {
    const server = new Koa()
    server.use(koaBody())
    const graphRouter = new Router({
        prefix: "/graph"
    })
    handlerGraph(graph, graphRouter)
    const graphEditRouter = new Router({
        prefix: "/graphEdit"
    })
    handlerGraphEdit(edit, graphEditRouter)
    const graphMetaRouter = new Router({
        prefix: "/graphMeta"
    })
    handlerGraphMeta(meta, graphMetaRouter)
    server.use(graphRouter.routes())
    server.use(graphRouter.allowedMethods())
    server.use(graphEditRouter.routes())
    server.use(graphEditRouter.allowedMethods())
    server.use(graphMetaRouter.routes())
    server.use(graphMetaRouter.allowedMethods())
    return server
}

function register(router: Router, path: string, delegate: (data: any) => Promise<any>) {
    router.post(path, async (ctx, next) => {
        let result = await delegate(ctx.request.body)
        if (result === undefined) {
            result = null
        }
        ctx.response.body = JSON.stringify(result)
        ctx.status = 200
        await next()
    })
}

function handlerGraph(graph: Graph, router: Router) {
    register(router, "/getNode",
        ({id}) => graph.getNode(id))
    register(router, "/searchNodes",
        ({searcher}) => graph.searchNodes(searcher))
    register(router, "/getRelationship",
        ({id}) => graph.getRelationship(id))
    register(router, "/searchRelationships",
        ({searcher}) => graph.searchRelationships(searcher))
}

function handlerGraphEdit(edit: GraphEdit, router: Router) {
    register(router, "/createNode",
        ({node}) => edit.createNode(node))
    register(router, "/editNode",
        ({id, node}) => edit.editNode(id, node))
    register(router, "/removeNode",
        ({id}) => edit.removeNode(id))
    register(router, "/createRelationship",
        ({relationship}) => edit.createRelationship(relationship))
    register(router, "/editRelationship",
        ({id, relationship}) => edit.editRelationship(id, relationship))
    register(router, "/removeRelationship",
        ({id}) => edit.removeRelationship(id))
}

function handlerGraphMeta(meta: GraphMeta, router: Router) {
    register(router, "/getNodeCellMeta",
        ({type}) => meta.getNodeCellMeta(type))
    register(router, "/getNodeDetailsMeta",
        ({type}) => meta.getNodeDetailsMeta(type))
    register(router, "/getNodeTypes",
        ({}) => meta.getNodeTypes())
    register(router, "/getRelationshipTypes",
        ({}) => meta.getRelationshipTypes())
}