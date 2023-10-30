import type {Callback, SubscribableHandler, SubscribeResult} from "../data/subscribe";
import {createEmptyHandler} from "../data/subscribe";
import type {Graph, GraphNode, NodeSearcher} from "../data/graph";
import {checkNode} from "../data/graph";
import type {ExtendableValue} from "../data/base";
import {randomElementId} from "../util";

export interface NodeSearchMonitor {
    createHandler(searcher: NodeSearcher, result: ExtendableValue<GraphNode[]>): SubscribableHandler<ExtendableValue<GraphNode[]>>

    notifyNodeChange(id: string, node: GraphNode | null): void
}

interface NodeSearchCallback {
    searcher: NodeSearcher,
    callback: Callback<ExtendableValue<GraphNode[]>>,
    previousResult: ExtendableValue<GraphNode[]>,
    handler: SubscribableHandler<ExtendableValue<GraphNode[]>>,
}


export function createNodeSearchMonitor(graph: Graph): NodeSearchMonitor {

    const nodeSearchCallback: Record<string, NodeSearchCallback> = {};

    function createHandler(searcher: NodeSearcher, result: ExtendableValue<GraphNode[]>): SubscribableHandler<ExtendableValue<GraphNode[]>> {
        const handler = createEmptyHandler<ExtendableValue<GraphNode[]>>("NodeSearchMonitor-Init");
        handler.subscribe = (callback: Callback<ExtendableValue<GraphNode[]>>): SubscribeResult => {
            const callbackId = randomElementId("NodeSearchMonitor");
            nodeSearchCallback[callbackId] = {
                searcher,
                callback,
                previousResult: result,
                handler,
            };
            return {
                stop: function () {
                    delete nodeSearchCallback[callbackId];
                }
            };
        };
        return handler;
    }

    async function _notifyNodeChange(id: string, node: GraphNode | null, callback: NodeSearchCallback): Promise<void> {
        const reload = callback.previousResult.value.some(node => node.id == id) || // check node in list
            node != null && checkNode(node, callback.searcher);
        if (reload) {
            callback.previousResult = await graph.searchNodes(callback.searcher);
            if (import.meta.env.DEV) {
                console.log(id, callback, node);
            }
            callback.callback(callback.previousResult);
        }
    }

    function notifyNodeChange(id: string, node: GraphNode | null): void {
        Object.values(nodeSearchCallback).forEach((c) => {
            _notifyNodeChange(id, node, c);
        });
    }


    return {
        createHandler,
        notifyNodeChange,
    }
}
