import {createContext} from "react";
import type {Graph, GraphEdit, GraphId, NodeSearcher} from "../../core";
import {emptySearcher, typeSearcher} from "../../core";
import type {PropertyViewData} from "./property.ts";

export type ViewData = NodeViewData | NodeDetailViewData | RelationshipDetailViewData


export interface NodeViewData {
    type: "NodeView",
    searcher: NodeSearcher,
    columns: PropertyViewData[]
}

export interface NodeDetailViewData {
    type: "NodeDetailView",
    nodeId: GraphId,
}

export function nodeDetailView(nodeId: GraphId): NodeDetailViewData {
    return {
        type: "NodeDetailView",
        nodeId,
    }
}

export interface RelationshipDetailViewData {
    type: "RelationshipDetailView",
    relationshipId: GraphId,
}

export function relationshipDetailView(relationshipId: GraphId): RelationshipDetailViewData {
    return {
        type: "RelationshipDetailView",
        relationshipId,
    }
}

export interface SavedViewData {
    name: string,
    data: ViewData,
}

export interface ViewHandler {
    updateView(view: ViewData): Promise<ViewData>

    getView(): Promise<ViewData>
}

export const ViewHandlerContext = createContext<ViewHandler>(null as any)

export function fromGraph(graph: Graph, graphEdit: GraphEdit): ViewHandler {
    return {
        async updateView(view: ViewData): Promise<ViewData> {
            let nodes = await graph.searchNodes(typeSearcher("View"));
            let id: GraphId
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