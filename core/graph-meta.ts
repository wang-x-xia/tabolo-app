import type {Graph, GraphNodeEditMeta, GraphNodeMeta} from "./graph.ts";
import {typeSearcher} from "./searcher.ts";


export interface GraphMeta {
    getNodeMeta(type: string): Promise<GraphNodeMeta>

    getNodeEditMeta(type: string): Promise<GraphNodeEditMeta>

    getNodeTypes(): Promise<string[]>

    getRelationshipTypes(): Promise<string[]>
}

export function createDefaultGraphMeta(graph: Graph): GraphMeta {
    async function getNodeMetaNode<T>(nodeType: string, metaType: string): Promise<T | null> {
        const metaNodes = await graph.searchNodes({
            type: "and",
            searchers: [
                typeSearcher(metaType),
                {
                    type: "eq",
                    jsonPath: "$.name",
                    value: nodeType
                }
            ]
        });
        if (metaNodes.length != 1) {
            console.log("Multiple meta nodes", metaNodes, nodeType, metaType)
            throw Error("Multiple meta nodes")
        } else if (metaNodes.length == 1) {
            return metaNodes[0].properties
        } else {
            return null
        }
    }

    return {
        async getNodeMeta(type: string): Promise<GraphNodeMeta> {
            const r = await getNodeMetaNode<GraphNodeMeta>(type, "NodeType")
            return r === null ? {name: type} : r;
        },

        async getNodeEditMeta(type: string): Promise<GraphNodeEditMeta> {
            const r = await getNodeMetaNode<GraphNodeEditMeta>(type, "Node Edit Meta")
            return r === null ? {markdownJsonPath: ""} : r
        },

        async getNodeTypes(): Promise<string[]> {
            const nodes = await graph.searchNodes(typeSearcher("NodeType"));
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