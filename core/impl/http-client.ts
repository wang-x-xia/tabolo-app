import type {Graph, GraphNode, GraphNodeEditMeta, GraphNodeMeta, GraphRelationship} from "../graph"
import type {GraphEdit, GraphNodeBody, GraphRelationshipBody} from "../graph-edit"
import type {GraphId} from "../graph-id";
import type {GraphMeta} from "../graph-meta.ts";
import type {GraphSuite} from "../graph-suite.ts";
import type {NodeSearcher} from "../node-searcher";
import type {RelationshipSearcher} from "../relationship-searcher";

export interface HttpClientConfig {
    baseUrl: string
}

async function jsonApi(url: string, data: any) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    if (response.status != 200) {
        throw new Error(`Invalid status code ${response.status}`)
    }
    const text = await response.text()
    try {
        return JSON.parse(text)
    } catch (e) {
        throw new Error(`Failed to parse ${text}`)
    }
}

export function createHttpClient({baseUrl}: HttpClientConfig): GraphSuite {
    return {
        graph: createHttpClientGraph({baseUrl: `${baseUrl}/graph`}),
        edit: createHttpClientGraphEdit({baseUrl: `${baseUrl}/graphEdit`}),
        meta: createHttpClientGraphMeta({baseUrl: `${baseUrl}/graphMeta`}),
    }
}

export function createHttpClientGraph(config: HttpClientConfig): Graph {
    return {
        async getNode(id: GraphId): Promise<GraphNode | null> {
            return jsonApi(`${config.baseUrl}/getNode`, {id})
        },
        async searchNodes(searcher: NodeSearcher): Promise<GraphNode[]> {
            return jsonApi(`${config.baseUrl}/searchNodes`, {searcher})
        },
        async getRelationship(id: GraphId): Promise<GraphRelationship | null> {
            return jsonApi(`${config.baseUrl}/getRelationship`, {id})
        },
        async searchRelationships(searcher: RelationshipSearcher): Promise<GraphRelationship[]> {
            return jsonApi(`${config.baseUrl}/searchRelationships`, {searcher})
        },
    }
}


export function createHttpClientGraphEdit(config: HttpClientConfig): GraphEdit {
    return {
        async createNode(node: GraphNodeBody): Promise<GraphNode> {
            return jsonApi(`${config.baseUrl}/createNode`, {node})
        },
        async createRelationship(relationship: GraphRelationshipBody): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/createRelationship`, {relationship})
        },
        async removeNode(id: GraphId): Promise<void> {
            return jsonApi(`${config.baseUrl}/removeNode`, {id})
        },
        async editNode(id: GraphId, node: Partial<GraphNodeBody>): Promise<GraphNode> {
            return jsonApi(`${config.baseUrl}/editNode`, {id, node})
        },
        async editRelationship(id: GraphId, relationship: Partial<GraphRelationshipBody>): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/editRelationship`, {id, relationship})
        },
        async removeRelationship(id: GraphId): Promise<void> {
            return jsonApi(`${config.baseUrl}/removeRelationship`, {id})
        },
    }
}

export function createHttpClientGraphMeta(config: HttpClientConfig): GraphMeta {
    return {
        async getNodeEditMeta(type): Promise<GraphNodeEditMeta> {
            return await jsonApi(`${config.baseUrl}/getNodeEditMeta`, {type})
        },
        async getNodeMeta(type: string): Promise<GraphNodeMeta> {
            return await jsonApi(`${config.baseUrl}/getNodeMeta`, {type})
        },
        async getNodeTypes(): Promise<string[]> {
            return await jsonApi(`${config.baseUrl}/getNodeTypes`, {})
        },
        async getRelationshipTypes(): Promise<string[]> {
            return await jsonApi(`${config.baseUrl}/getRelationshipTypes`, {})
        }

    }
}