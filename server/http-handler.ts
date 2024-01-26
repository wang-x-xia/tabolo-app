import Router from "@koa/router";
import Koa from "koa";
import {koaBody} from "koa-body"
import {Graph, GraphEdit} from "../core"

export function koaServer(graph: Graph, edit: GraphEdit): Koa {
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
    server.use(graphRouter.routes())
    server.use(graphRouter.allowedMethods());
    server.use(graphEditRouter.routes())
    server.use(graphEditRouter.allowedMethods())
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
    register(router, "/newEmptyNode",
        ({}) => edit.newEmptyNode())
    register(router, "/editNodeType",
        ({id, type}) => edit.editNodeType(id, type))
    register(router, "/editNodeProperty",
        ({id, properties}) => edit.editNodeProperty(id, properties))
    register(router, "/removeNode",
        ({id}) => edit.removeNode(id))
    register(router, "/copyNode",
        ({id}) => edit.copyNode(id))
    register(router, "/newEmptyRelationship",
        ({startNodeId, endNodeId}) => edit.newEmptyRelationship(startNodeId, endNodeId))
    register(router, "/editRelationshipType",
        ({id, type}) => edit.editRelationshipType(id, type))
    register(router, "/editRelationshipStartNode",
        ({id, nodeId}) => edit.editRelationshipStartNode(id, nodeId))
    register(router, "/editRelationshipEndNode",
        ({id, nodeId}) => edit.editRelationshipEndNode(id, nodeId))
    register(router, "/editRelationshipProperty",
        ({id, properties}) => edit.editRelationshipProperty(id, properties))
    register(router, "/removeRelationship",
        ({id}) => edit.removeRelationship(id))
    register(router, "/copyRelationship",
        ({id}) => edit.copyRelationship(id))
}