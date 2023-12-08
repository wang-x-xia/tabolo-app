import {defineInContext} from "../util";
import type {Graph} from "./graph";
import type {GraphEdit} from "../edit/graph-edit";
import type {NodeSearcher} from "./node-searcher";
import {emptySearcher, typeSearcher} from "./searcher";

export type ViewData = NodeViewData | NodeEditViewData


export interface NodeViewData {
    type: "NodeView",
    searcher: NodeSearcher,
}

export interface NodeEditViewData {
    type: "NodeEditView",
    nodeId: string,
}

export interface TaboloUI {
    updateView(view: ViewData): Promise<ViewData>

    getView(): Promise<ViewData>
}

export const [getTaboloUI, setTaboloUI] = defineInContext<TaboloUI>("UI")

export function fromGraph(graph: Graph, graphEdit: GraphEdit): TaboloUI {
    return {
        async updateView(view: ViewData): Promise<ViewData> {
            let nodes = await graph.searchNodes(typeSearcher("View"));
            let id: string
            if (nodes.length == 0) {
                let node = await graphEdit.newEmptyNode();
                id = node.id
                await graphEdit.editNodeType(id, "View")
            } else {
                id = nodes[0].id
            }
            return (await graphEdit.editNodeProperty(id, view)).properties
        },

        async getView() {
            let nodes = await graph.searchNodes(typeSearcher("View"));
            if (nodes.length == 0) {
                return {type: "NodeView", searcher: emptySearcher()}
            } else {
                return nodes[0].properties
            }
        },
    }
}