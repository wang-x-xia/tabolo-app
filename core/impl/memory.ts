import type {Graph, GraphNode, GraphRelationship} from "../graph";
import type {GraphEdit} from "../graph-edit";
import type {GraphId} from "../graph-id";
import {createDefaultGraphMeta, type GraphMeta} from "../graph-meta";
import type {GraphSuite} from "../graph-suite";
import {checkNode, type NodeSearcher} from "../node-searcher";
import {checkRelationship, type RelationshipSearcher} from "../relationship-searcher";

export interface MemoryConfiguration {
    handler: MemoryHandler,
}

/**
 * All methods are sync to avoid concurrency write
 */
export interface MemoryHandler {

    nodes(): Record<string, GraphNode>

    relationships(): Record<string, GraphRelationship>

    saveNodes(nodes: Record<string, GraphNode>): void

    saveRelationships(relationships: Record<string, GraphRelationship>): void
}

export function createDefaultMemoryHandler(): MemoryHandler {
    const data = {nodes: "{}", relationships: "{}"}

    return {
        nodes(): Record<string, GraphNode> {
            return JSON.parse(data.nodes)
        },
        relationships(): Record<string, GraphRelationship> {
            return JSON.parse(data.relationships)
        },
        saveNodes(nodes: Record<string, GraphNode>): void {
            data.nodes = JSON.stringify(nodes)
        },
        saveRelationships(relationships: Record<string, GraphRelationship>): void {
            data.relationships = JSON.stringify(relationships)
        }
    }
}

export function createMemoryGraph(config: MemoryConfiguration): GraphSuite {
    const graph = createGraph(config)
    const edit = createGraphEdit(config)
    const meta = createGraphMeta(config, graph)
    return {graph, edit, meta}
}

function assertIdIsString(id: GraphId): asserts id is string {
    if (typeof id === "string") {
        return
    }
    throw new Error(`Invalid ID for memory ${JSON.stringify(id)}`)
}

function createGraph({handler}: MemoryConfiguration): Graph {

    function mapUndefinedToNull<T>(value: T | undefined): T | null {
        if (value === undefined) {
            return null
        } else {
            return value
        }
    }

    return {
        async getNode(id: GraphId): Promise<GraphNode | null> {
            assertIdIsString(id)
            return mapUndefinedToNull(handler.nodes()[id])
        },
        async searchNodes(searcher: NodeSearcher): Promise<GraphNode[]> {
            const nodes = Object.values(handler.nodes())
            return nodes.filter(it => checkNode(it, searcher));
        },
        async getRelationship(id: string): Promise<GraphRelationship | null> {
            assertIdIsString(id)
            return mapUndefinedToNull(handler.relationships()[id])
        },
        async searchRelationships(searcher: RelationshipSearcher): Promise<GraphRelationship[]> {
            const relationships = Object.values(handler.relationships())
            return relationships.filter(it => checkRelationship(it, searcher));
        },
    }
}


function createGraphEdit({handler}: MemoryConfiguration): GraphEdit {
    return {
        async createNode({type, properties}): Promise<GraphNode> {
            const id = window.crypto.randomUUID()
            const node: GraphNode = {id, type, properties,}
            const nodes = handler.nodes()
            nodes[id] = node
            handler.saveNodes(nodes)
            return node
        },
        async editNode(id, {type, properties}): Promise<GraphNode> {
            assertIdIsString(id)
            const nodes = handler.nodes()
            const node = nodes[id]
            if (type !== undefined) {
                node.type = type
            }
            if (properties !== undefined) {
                node.properties = properties
            }
            handler.saveNodes(nodes)
            return node
        },
        async removeNode(id): Promise<void> {
            assertIdIsString(id)
            const nodes = handler.nodes()
            delete nodes[id]
            handler.saveNodes(nodes)
        },
        async createRelationship({type, properties, startNodeId, endNodeId}): Promise<GraphRelationship> {
            const id = window.crypto.randomUUID()
            const relationship: GraphRelationship = {id, type, properties, startNodeId, endNodeId,}
            const relationships = handler.relationships()
            relationships[id] = relationship
            handler.saveRelationships(relationships)
            return relationship
        },
        async editRelationship(id, {type, properties, startNodeId, endNodeId}): Promise<GraphRelationship> {
            assertIdIsString(id)
            const relationships = handler.relationships()
            const relationship = relationships[id]
            if (type !== undefined) {
                relationship.type = type
            }
            if (properties !== undefined) {
                relationship.properties = properties
            }
            if (startNodeId !== undefined) {
                relationship.startNodeId = startNodeId
            }
            if (endNodeId !== undefined) {
                relationship.endNodeId = endNodeId
            }
            handler.saveRelationships(relationships)
            return relationship
        },
        async removeRelationship(id): Promise<void> {
            assertIdIsString(id)
            const relationships = handler.relationships()
            delete relationships[id]
            handler.saveRelationships(relationships)
        },
    }
}

function createGraphMeta({handler}: MemoryConfiguration, graph: Graph): GraphMeta {
    const meta = createDefaultGraphMeta(graph);

    return {
        ...meta,
        async getNodeTypes(): Promise<string[]> {
            const types = new Set<string>()
            for (const node of Object.values(handler.nodes())) {
                types.add(node.type)
            }
            return [...types]
        },
        async getRelationshipTypes(): Promise<string[]> {
            const types = new Set<string>()
            for (const relationship of Object.values(handler.relationships())) {
                types.add(relationship.type)
            }
            return [...types]
        },
    }
}

