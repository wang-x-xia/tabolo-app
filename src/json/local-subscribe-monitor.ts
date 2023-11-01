import type {Graph, GraphNode} from "../data/graph";
import type {GraphEdit} from "../edit/graph-edit";
import type {ExtendableValue} from "../data/base";
import {extendSubscribable} from "../data/subscribe";
import {createNodeIdMonitor} from "./node-id-monitor";
import {createNodeSearchMonitor} from "./node-search-monitor";
import type {NodeSearcher} from "../data/node-searcher";


export function localSubscribeMonitor(p: { graph: Graph, edit: GraphEdit }): { graph: Graph, edit: GraphEdit } {
    const {graph, edit} = p

    const nodeIdMonitor = createNodeIdMonitor();
    const nodeSearchMonitor = createNodeSearchMonitor(graph);

    function decoratorNodeChange<T extends (...arg: any) => Promise<GraphNode>>(fn: T): T {
        return async function (...args): Promise<GraphNode> {
            const node = await fn(...args);
            nodeIdMonitor.notifyChange(node.id, node);
            nodeSearchMonitor.notifyNodeChange(node.id, node);
            console.log(args, node);
            return extendSubscribable(node, nodeIdMonitor.createHandler(node.id))
        } as T;
    }

    return {
        graph: {
            getNode: async function (id: string): Promise<GraphNode | null> {
                return extendSubscribable(await graph.getNode(id), nodeIdMonitor.createHandler(id));
            },
            getNodes: async function (ids: string[]): Promise<ExtendableValue<Record<string, GraphNode>>> {
                // TODO
                return await graph.getNodes(ids);
            },
            searchNodes: async function (searcher: NodeSearcher): Promise<ExtendableValue<GraphNode[]>> {
                const result = await graph.searchNodes(searcher);
                return extendSubscribable(result, nodeSearchMonitor.createHandler(searcher, result));
            },
            searchRelationships: graph.searchRelationships.bind(graph),
        },
        edit: {
            addLabelToNode: decoratorNodeChange(edit.addLabelToNode.bind(edit)),
            copyNode: decoratorNodeChange(edit.copyNode.bind(edit)),
            editNodeProperty: decoratorNodeChange(edit.editNodeProperty.bind(edit)),
            newEmptyNode: decoratorNodeChange(edit.newEmptyNode.bind(edit)),
            removeLabelFromNode: decoratorNodeChange(edit.removeLabelFromNode.bind(edit)),
            removeNode: async function (id: string): Promise<void> {
                await edit.removeNode(id);
                nodeIdMonitor.notifyChange(id, null);
                nodeSearchMonitor.notifyNodeChange(id, null);
            },
            removeNodeProperty: decoratorNodeChange(edit.removeNodeProperty.bind(edit)),
        },
    }
}

