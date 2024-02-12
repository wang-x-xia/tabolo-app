import type {Graph, GraphNode, GraphRelationship} from "../graph"
import type {GraphEdit} from "../graph-edit"
import type {GraphId} from "../graph-id";
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
        async newEmptyNode(): Promise<GraphNode> {
            return jsonApi(`${config.baseUrl}/newEmptyNode`, {})
        },
        async editNodeType(id: GraphId, type: string): Promise<GraphNode> {
            return jsonApi(`${config.baseUrl}/editNodeType`, {id, type})
        },
        async editNodeProperty(id: GraphId, properties: any): Promise<GraphNode> {
            return jsonApi(`${config.baseUrl}/editNodeProperty`, {id, properties})
        },
        async removeNode(id: GraphId): Promise<void> {
            return jsonApi(`${config.baseUrl}/removeNode`, {id})
        },
        async copyNode(id: GraphId): Promise<GraphNode> {
            return jsonApi(`${config.baseUrl}/copyNode`, {id})
        },
        async newEmptyRelationship(startNodeId: GraphId, endNodeId: GraphId): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/newEmptyRelationship`, {startNodeId, endNodeId})
        },
        async editRelationshipType(id: GraphId, type: string): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/editRelationshipType`, {id, type})
        },
        async editRelationshipStartNode(id: GraphId, nodeId: GraphId): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/editRelationshipStartNode`, {id, nodeId})
        },
        async editRelationshipEndNode(id: GraphId, nodeId: GraphId): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/editRelationshipEndNode`, {id, nodeId})
        },
        async editRelationshipProperty(id: GraphId, properties: any): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/editRelationshipProperty`, {id, properties})
        },
        async removeRelationship(id: GraphId): Promise<void> {
            return jsonApi(`${config.baseUrl}/removeRelationship`, {id})

        },
        async copyRelationship(id: GraphId): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/copyRelationship`, {id})
        },
    }
}