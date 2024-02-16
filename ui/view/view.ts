import {createContext} from "react";
import {
    alwaysTrueSearcher,
    type Graph,
    type GraphEdit,
    type GraphId,
    type GraphNode,
    type NodeSearcher,
    typeSearcher
} from "../../core";
import type {PropertyViewData} from "./property.ts";

export type ViewData = LoadingViewData | NodeViewData | NodeDetailViewData | RelationshipDetailViewData

export interface LoadingViewData {
    type: "Loading",
}

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
            let node: GraphNode
            if (nodes.length == 0) {
                node = await graphEdit.createNode({
                    type: "View",
                    properties: view,
                });
            } else {
                node = await graphEdit.editNode(nodes[0].id, {properties: view})
            }
            return node.properties
        },

        async getView() {
            let nodes = await graph.searchNodes(typeSearcher("View"));
            if (nodes.length == 0) {
                return {type: "NodeView", searcher: alwaysTrueSearcher()}
            } else {
                return nodes[0].properties
            }
        },
    }
}