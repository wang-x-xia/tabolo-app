import type {Graph, GraphEdit, GraphNode, GraphRelationship, NodeSearcher, RelationshipSearcher} from "../../core";
import {checkNode, checkRelationship} from "../../core";

export interface LocalStorageConfiguration {
    name: string
}

export function createLocalStorage(config: LocalStorageConfiguration): [Graph, GraphEdit] {
    const graph = createGraph(config)
    const graphEdit = createGraphEdit(config)
    return [graph, graphEdit]
}

function createGraph(config: LocalStorageConfiguration): Graph {

    const {name} = config

    function getValues(source: "node" | "relationship"): Record<string, any> {
        return JSON.parse(localStorage.getItem(`${name}-${source}`)) || {}
    }

    function getValue(source: "node" | "relationship", id: string): any | null {
        const item = getValues(source)[id]
        if (item === undefined) {
            return null
        } else {
            return item
        }
    }

    return {
        async getNode(id: string): Promise<GraphNode | null> {
            return getValue("node", id)
        },

        async searchNodes(searcher: NodeSearcher): Promise<GraphNode[]> {
            const nodes = Object.values(getValues("node"))
            return nodes.filter(it => checkNode(it, searcher));
        },

        async getRelationship(id: string): Promise<GraphRelationship | null> {
            return await getValue("relationship", id)
        },

        async searchRelationships(searcher: RelationshipSearcher): Promise<GraphRelationship[]> {
            const relationships = Object.values(getValues("relationship"))
            return relationships.filter(it => checkRelationship(it, searcher));
        },
    }
}


function createGraphEdit(config: LocalStorageConfiguration): GraphEdit {
    const {name} = config

    function editValues<T>(source: "node" | "relationship", fn: (data: Record<string, any>) => T): T {
        const values = JSON.parse(localStorage.getItem(`${name}-${source}`)) || {}
        const result = fn(values)
        localStorage.setItem(`${name}-${source}`, JSON.stringify(values))
        return result
    }

    return {
        async newEmptyNode(): Promise<GraphNode> {
            return editValues("node", nodes => {
                const id = window.crypto.randomUUID()
                const node: GraphNode = {
                    id,
                    type: "New",
                    properties: {}
                }
                nodes[id] = node
                return node
            })
        },
        async editNodeType(id: string, type: string): Promise<GraphNode> {
            return editValues("node", nodes => {
                const node: GraphNode = nodes[id]
                node.type = type
                return node
            })
        },
        async editNodeProperty(id: string, properties: any): Promise<GraphNode> {
            return editValues("node", nodes => {
                const node: GraphNode = nodes[id]
                node.properties = properties
                return node
            })
        },
        async removeNode(id: string): Promise<void> {
            return editValues("node", nodes => {
                delete nodes[id]
            })
        },
        async copyNode(id: string): Promise<GraphNode> {
            return editValues("node", nodes => {
                const node: GraphNode = nodes[id]
                const newId = window.crypto.randomUUID()
                const newNode: GraphNode = {
                    ...node,
                    id: newId,
                }
                nodes[newId] = newNode
                return newNode
            })
        },
        async newEmptyRelationship(startNodeId: string, endNodeId: string): Promise<GraphRelationship> {
            return editValues("relationship", relationships => {
                const id = window.crypto.randomUUID()
                const relationship: GraphRelationship = {
                    id,
                    type: "New",
                    startNodeId,
                    endNodeId,
                    properties: {}
                }
                relationships[id] = relationship
                return relationship
            })
        },
        async editRelationshipType(id: string, type: string): Promise<GraphRelationship> {
            return editValues("relationship", relationships => {
                const relationship: GraphRelationship = relationships[id]
                relationship.type = type
                return relationship
            })
        },
        async editRelationshipStartNode(id: string, nodeId: string): Promise<GraphRelationship> {
            return editValues("relationship", relationships => {
                const relationship: GraphRelationship = relationships[id]
                relationship.startNodeId = nodeId
                return relationship
            })
        },
        async editRelationshipEndNode(id: string, nodeId: string): Promise<GraphRelationship> {
            return editValues("relationship", relationships => {
                const relationship: GraphRelationship = relationships[id]
                relationship.endNodeId = nodeId
                return relationship
            })
        },
        async editRelationshipProperty(id: string, properties: any): Promise<GraphRelationship> {
            return editValues("relationship", relationships => {
                const relationship: GraphRelationship = relationships[id]
                relationship.properties = properties
                return relationship
            })
        },
        async removeRelationship(id: string): Promise<void> {
            return editValues("relationship", relationships => {
                delete relationships[id]
            })
        },
        async copyRelationship(id: string): Promise<GraphRelationship> {
            return editValues("relationship", relationships => {
                const relationship: GraphRelationship = relationships[id]
                const newId = window.crypto.randomUUID()
                const newRelationship: GraphRelationship = {
                    ...relationship,
                    id: newId,
                }
                relationships[newId] = newRelationship
                return newRelationship
            })
        }
    }
}

