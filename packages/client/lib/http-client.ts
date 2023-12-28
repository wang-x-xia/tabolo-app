import {Graph, GraphEdit, GraphNode, GraphRelationship} from "tabolo-core"
import {NodeSearcher} from "tabolo-core/lib/node-searcher";
import {RelationshipSearcher} from "tabolo-core/lib/relationship-searcher";

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
        async getNode(id: string): Promise<GraphNode | null> {
            return jsonApi(`${config.baseUrl}/getNode`, {id})
        },
        async searchNodes(searcher: NodeSearcher): Promise<GraphNode[]> {
            return jsonApi(`${config.baseUrl}/searchNodes`, {searcher})
        },
        async getRelationship(id: string): Promise<GraphRelationship | null> {
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
        async editNodeType(id: string, type: string): Promise<GraphNode> {
            return jsonApi(`${config.baseUrl}/editNodeType`, {id, type})
        },
        async editNodeProperty(id: string, properties: any): Promise<GraphNode> {
            return jsonApi(`${config.baseUrl}/editNodeProperty`, {id, properties})
        },
        async removeNode(id: string): Promise<void> {
            return jsonApi(`${config.baseUrl}/removeNode`, {id})
        },
        async copyNode(id: string): Promise<GraphNode> {
            return jsonApi(`${config.baseUrl}/copyNode`, {id})
        },
        async newEmptyRelationship(startNodeId: string, endNodeId: string): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/newEmptyRelationship`, {startNodeId, endNodeId})
        },
        async editRelationshipType(id: string, type: string): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/editRelationshipType`, {id, type})
        },
        async editRelationshipStartNode(id: string, nodeId: string): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/editRelationshipStartNode`, {id, nodeId})
        },
        async editRelationshipEndNode(id: string, nodeId: string): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/editRelationshipEndNode`, {id, nodeId})
        },
        async editRelationshipProperty(id: string, properties: any): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/editRelationshipProperty`, {id, properties})
        },
        async removeRelationship(id: string): Promise<void> {
            return jsonApi(`${config.baseUrl}/removeRelationship`, {id})

        },
        async copyRelationship(id: string): Promise<GraphRelationship> {
            return jsonApi(`${config.baseUrl}/copyRelationship`, {id})
        },
    }
}