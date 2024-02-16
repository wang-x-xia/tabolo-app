import {
    defaultGraphNodeCellMeta,
    defaultGraphNodeDetailsMeta,
    type Graph,
    type GraphNode,
    type GraphNodeCellMeta,
    type GraphNodeDetailsMeta
} from "./graph.ts";
import type {NodeSearcher} from "./node-searcher.ts";
import {relationshipNodeSearcher} from "./relationship-searcher.ts";
import {matchAllSearcher, propertySearcher, typeSearcher} from "./searcher.ts";


export interface GraphMeta {
    getNodeCellMeta(type: string): Promise<GraphNodeCellMeta>

    getNodeDetailsMeta(type: string): Promise<GraphNodeDetailsMeta>

    getNodeTypes(): Promise<string[]>

    getRelationshipTypes(): Promise<string[]>
}

export async function searchOneNode(graph: Graph, searcher: NodeSearcher): Promise<GraphNode | null> {
    const nodes = await graph.searchNodes(searcher)
    if (nodes.length > 1) {
        console.log("Multiple nodes of", searcher)
        return nodes[0]
    } else if (nodes.length == 1) {
        return nodes[0]
    } else {
        return null
    }
}

export function createDefaultGraphMeta(graph: Graph): GraphMeta {
    async function getNodeMetaNode<T>(nodeType: string, metaType: string): Promise<T | null> {
        const typeNode = await searchOneNode(graph, matchAllSearcher([
            typeSearcher(NodeType),
            propertySearcher("$.name", nodeType),
        ]))
        if (typeNode === null) {
            return null
        }
        const has = await graph.searchRelationships(matchAllSearcher([
            typeSearcher("Has"),
            relationshipNodeSearcher(typeNode.id, "start"),
        ]))
        for (const r of has) {
            const node = await graph.getNode(r.endNodeId)
            if (node === null) {
                console.log("Failed to find node by id", r)
                continue
            }
            if (node.type === metaType) {
                return node.properties
            }
        }
        return null
    }

    return {
        async getNodeCellMeta(type: string): Promise<GraphNodeCellMeta> {
            const r = await getNodeMetaNode<GraphNodeCellMeta>(type, "Node Cell Meta")
            return r === null ? defaultGraphNodeCellMeta() : r;
        },

        async getNodeDetailsMeta(type: string): Promise<GraphNodeDetailsMeta> {
            const r = await getNodeMetaNode<GraphNodeDetailsMeta>(type, "Node Edit Meta")
            return r === null ? defaultGraphNodeDetailsMeta() : r
        },

        async getNodeTypes(): Promise<string[]> {
            const nodes = await graph.searchNodes(typeSearcher(NodeType));
            const types = new Set<string>();
            nodes.forEach(node => {
                types.add(node.properties["name"]);
            });
            return Array.from(types).sort();
        },

        async getRelationshipTypes(): Promise<string[]> {
            const nodes = await graph.searchNodes(typeSearcher("RelationshipType"));
            const types = new Set<string>();
            nodes.forEach(node => {
                types.add(node.properties["name"]);
            });
            return Array.from(types).sort();
        }
    }
}

export const NodeType = "NodeType"
