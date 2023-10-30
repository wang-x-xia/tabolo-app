import type {Callback, SubscribableHandler, SubscribeResult} from "../data/subscribe";
import {createEmptyHandler} from "../data/subscribe";
import type {GraphNode} from "../data/graph";
import {randomElementId} from "../util";

export interface NodeIdMonitor {
    createHandler(id: string): SubscribableHandler<GraphNode>

    notifyChange(id: string, node: GraphNode | null): void
}

interface NodeIdCallback {
    callback: Callback<GraphNode>
    handler: SubscribableHandler<GraphNode>
}

export function createNodeIdMonitor(): NodeIdMonitor {

    const nodeIdCallbacks: Record<string, Record<string, NodeIdCallback>> = {};

    function createHandler(id: string): SubscribableHandler<GraphNode> {
        const handler = createEmptyHandler<GraphNode>("NodeIdMonitor-Init");
        handler.subscribe = (callback: Callback<GraphNode>): SubscribeResult => {
            const callbackId = randomElementId("NodeIdMonitor");
            if (!(id in nodeIdCallbacks)) {
                nodeIdCallbacks[id] = {}
            }
            nodeIdCallbacks[id][callbackId] = {
                callback,
                handler,
            };
            return {
                stop: function () {
                    delete nodeIdCallbacks[id][callbackId];
                }
            };
        }
        return handler;
    }

    function notifyChange(id: string, node: GraphNode | null) {
        if (node != null && id in nodeIdCallbacks) {
            Object.values(nodeIdCallbacks[id]).forEach(c => {
                try {
                    if (import.meta.env.DEV) {
                        console.log(id, c, node);
                    }
                    c.callback(node);
                    c.handler.provider = "NodeIdMonitor-Changed"
                } catch (e) {
                    console.log(e);
                }
            });
        }
    }

    return {
        createHandler,
        notifyChange,
    }
}
