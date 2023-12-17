import {defineInContext} from "../util";
import type {Graph} from "tabolo-core/lib/graph";
import type {GraphEdit} from "../edit/graph-edit";
import type {NodeSearcher} from "tabolo-core/lib/node-searcher";
import {emptySearcher, typeSearcher} from "tabolo-core/lib/searcher";

export type ViewData = NodeViewData | NodeEditViewData | RelationshipEditViewData


export interface NodeViewData {
    type: "NodeView",
    searcher: NodeSearcher,
}

export interface NodeEditViewData {
    type: "NodeEditView",
    nodeId: string,
}

export interface RelationshipEditViewData {
    type: "RelationshipEditView",
    relationshipId: string,
}

export interface SavedViewData {
    name: string,
    data: ViewData,
}

export interface ViewHandler {
    updateView(view: ViewData): Promise<ViewData>

    getView(): Promise<ViewData>
}

export const [getViewHandler, setViewHandler] = defineInContext<ViewHandler>("viewHandler")

export function fromGraph(graph: Graph, graphEdit: GraphEdit): ViewHandler {
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