import type {GraphEdit, GraphNodeBody, GraphRelationshipBody} from "../graph-edit.ts";
import type {GraphId} from "../graph-id.ts";
import {createDefaultGraphMeta, type GraphMeta} from "../graph-meta.ts";
import type {GraphSuite} from "../graph-suite.ts";
import type {Graph, GraphNode, GraphNodeCellMeta, GraphNodeDetailsMeta, GraphRelationship} from "../graph.ts";
import type {NodeSearcher} from "../node-searcher.ts";
import {relationshipNodeSearcher, type RelationshipSearcher} from "../relationship-searcher.ts";
import {
    alwaysFalseSearcher,
    matchAllSearcher,
    matchAnySearcher,
    typeSearcher,
    visitGraphResourceSearcher
} from "../searcher.ts";

export interface TypeDispatcherConfiguration {
    suites: Record<string, GraphSuite>
    nodeTypes: Record<string, string>
    relationshipTypes: Record<string, string>
}

export interface DispatcherGraphId {
    suite: string,
    id: GraphId,
}


export function createTypeDispatcher(config: TypeDispatcherConfiguration): GraphSuite {
    const internalOp = createInternalOp(config)
    const graph = createTypeDispatcherGraph(internalOp)
    const edit = createTypeDispatcherGraphEdit(internalOp)
    const meta = {
        ...createDefaultGraphMeta(graph),
        ...createTypeDispatcherGraphMeta(internalOp)
    }
    return {graph, edit, meta}
}

interface InternalOp {
    suiteIds(): string[]

    getSuite(suiteId: string): InternalSuite

    getNodeSuite(type: string): InternalSuite

    getRelationshipSuite(type: string): InternalSuite

    getNodeTypes(): string[]

    getRelationshipTypes(): string[]
}

interface InternalSuite extends GraphSuite {
    id: string,

    replaceNodeGraphId(node: GraphNode): GraphNode,

    replaceRelationshipGraphId(relationship: GraphRelationship): GraphRelationship,

    resolveGraphId(id: GraphId, field: string): GraphId

    resolveRelationshipSearcher(searcher: RelationshipSearcher): RelationshipSearcher

    resolveNodeSearcher(searcher: NodeSearcher): NodeSearcher
}

function createInternalOp(
    {
        suites,
        nodeTypes,
        relationshipTypes,
    }: TypeDispatcherConfiguration): InternalOp {


    function getSuite(suiteId: string): InternalSuite {
        const suite = suites[suiteId]
        if (suite !== undefined) {

            function replaceGraphId(id: GraphId): DispatcherGraphId {
                return {
                    suite: suiteId,
                    id,
                }
            }

            function resolveGraphId(id: GraphId, field: string): GraphId {
                assertDispatcherGraphId(id)
                if (id.suite != suiteId) {
                    throw new Error(`Not in suite ${suiteId}, ${field} = ${JSON.stringify(id)}`)
                }
                return id.id
            }

            function nodeTypesOfSuite(): string[] {
                return Object.entries(nodeTypes)
                    .filter(([_, s]) => s == suiteId)
                    .map(([t, _]) => t)
            }

            function resolveNodeSearcher(searcher: NodeSearcher): NodeSearcher {
                return matchAllSearcher([
                    visitGraphResourceSearcher(searcher, (s) => {
                        switch (s.type) {
                            case "type":
                                return nodeTypes[s.value] == suiteId ? s : alwaysFalseSearcher()
                            default:
                                return s
                        }
                    }),
                    matchAnySearcher(nodeTypesOfSuite().map(t => typeSearcher(t)))
                ])
            }

            function relationshipTypesOfSuite(): string[] {
                return Object.entries(relationshipTypes)
                    .filter(([_, s]) => s == suiteId)
                    .map(([t, _]) => t)
            }

            function resolveRelationshipSearcher(searcher: RelationshipSearcher): RelationshipSearcher {
                return matchAllSearcher([
                    visitGraphResourceSearcher(searcher, (s) => {
                        switch (s.type) {
                            case "type":
                                return relationshipTypes[s.value] == suiteId ? s : alwaysFalseSearcher()
                            case "node":
                                assertDispatcherGraphId(s.nodeId)
                                if (s.nodeId.suite !== suiteId) {
                                    return alwaysFalseSearcher()
                                }
                                return relationshipNodeSearcher(
                                    resolveGraphId(s.nodeId, "RelationshipNodeSearcher.nodeId"),
                                    s.match)
                            default:
                                return s
                        }
                    }),
                    matchAnySearcher(relationshipTypesOfSuite().map(t => typeSearcher(t)))
                ])
            }

            return {
                ...suite,
                id: suiteId,
                replaceNodeGraphId(node) {
                    node.id = replaceGraphId(node.id)
                    return node
                },
                replaceRelationshipGraphId(relationship) {
                    relationship.id = replaceGraphId(relationship.id)
                    relationship.startNodeId = replaceGraphId(relationship.startNodeId)
                    relationship.endNodeId = replaceGraphId(relationship.endNodeId)
                    return relationship
                },
                resolveGraphId,
                resolveNodeSearcher,
                resolveRelationshipSearcher,
            }
        }
        throw new Error(`Unknown suite ${suiteId}`)
    }

    return {
        suiteIds() {
            return Object.keys(suites)
        },
        getSuite,
        getNodeSuite(type: string): InternalSuite {
            const suiteId = nodeTypes[type]
            if (suiteId !== undefined) {
                return getSuite(suiteId)
            }
            throw new Error(`Unknown Relationship Type ${type}`)
        },
        getRelationshipSuite(type: string): InternalSuite {
            const suiteId = relationshipTypes[type]
            if (suiteId !== undefined) {
                return getSuite(suiteId)
            }
            throw new Error(`Unknown Relationship Type ${type}`)
        },
        getNodeTypes(): string[] {
            return Object.keys(nodeTypes)
        },
        getRelationshipTypes(): string[] {
            return Object.keys(relationshipTypes)
        },
    }
}


function assertDispatcherGraphId(id: GraphId): asserts id is DispatcherGraphId {
    if (typeof id === 'object' && id !== null && "suite" in id && "id" in id) {
        return
    }
    throw new Error(`Invalid ID for type dispatcher ${JSON.stringify(id)}`)
}

export function createTypeDispatcherGraph({suiteIds, getSuite}: InternalOp): Graph {
    return {
        async getNode(id): Promise<GraphNode | null> {
            assertDispatcherGraphId(id)
            const {graph, replaceNodeGraphId} = getSuite(id.suite)
            const node = await graph.getNode(id.id)
            if (node == null) {
                return null
            }
            return replaceNodeGraphId(node)
        },
        async getRelationship(id): Promise<GraphRelationship | null> {
            assertDispatcherGraphId(id)
            const {graph, replaceRelationshipGraphId} = getSuite(id.suite)
            const relationship = await graph.getRelationship(id.id)
            if (relationship == null) {
                return null
            }
            return replaceRelationshipGraphId(relationship)
        },
        async searchNodes(searcher): Promise<GraphNode[]> {
            const result: GraphNode[] = []
            for (const suiteId of suiteIds()) {
                const {graph, replaceNodeGraphId, resolveNodeSearcher} = getSuite(suiteId)
                const items = await graph.searchNodes(resolveNodeSearcher(searcher))
                result.push(...items.map(it => replaceNodeGraphId(it)))
            }
            return result
        },

        async searchRelationships(searcher): Promise<GraphRelationship[]> {
            const result: GraphRelationship[] = []
            for (const suiteId of suiteIds()) {
                const {graph, replaceRelationshipGraphId, resolveRelationshipSearcher} = getSuite(suiteId)
                const items = await graph.searchRelationships(resolveRelationshipSearcher(searcher))
                result.push(...items.map(it => replaceRelationshipGraphId(it)))
            }
            return result
        },
    }
}


export function createTypeDispatcherGraphEdit(
    {
        getSuite,
        getNodeSuite,
        getRelationshipSuite,
    }: InternalOp): GraphEdit {
    return {
        async createNode(node: GraphNodeBody): Promise<GraphNode> {
            const {edit, replaceNodeGraphId} = getNodeSuite(node.type)
            return replaceNodeGraphId(await edit.createNode(node))
        },
        async createRelationship(relationship: GraphRelationshipBody): Promise<GraphRelationship> {
            const {edit, replaceRelationshipGraphId, resolveGraphId} = getRelationshipSuite(relationship.type)
            const body = {
                ...relationship,
                startNodeId: resolveGraphId(relationship.startNodeId, "StartNodeId"),
                endNodeId: resolveGraphId(relationship.endNodeId, "EndNodeId")
            }
            return replaceRelationshipGraphId(await edit.createRelationship(body))
        },
        async editNode(id: GraphId, node: Partial<GraphNodeBody>): Promise<GraphNode> {
            assertDispatcherGraphId(id)
            const {edit, id: currentSuiteId, replaceNodeGraphId} = getSuite(id.suite)
            if (node.type !== undefined) {
                const {id: afterSuiteId} = getNodeSuite(node.type)
                if (afterSuiteId != currentSuiteId) {
                    throw new Error(`Not allow change the type between suites, from ${currentSuiteId} to ${afterSuiteId}(${node.type})`)
                }
            }
            return replaceNodeGraphId(await edit.editNode(id.id, node))
        },
        async editRelationship(id: GraphId, relationship: Partial<GraphRelationshipBody>): Promise<GraphRelationship> {
            assertDispatcherGraphId(id)
            const {edit, id: currentSuiteId, replaceRelationshipGraphId, resolveGraphId} = getSuite(id.suite)
            if (relationship.type !== undefined) {
                const {id: afterSuiteId} = getRelationshipSuite(relationship.type)
                if (afterSuiteId != currentSuiteId) {
                    throw new Error(`Not allow change the type between suites, from ${currentSuiteId} to ${afterSuiteId}(${relationship.type})`)
                }
            }
            // copy self for modified
            const body = {...relationship}
            if (body.startNodeId !== undefined) {
                body.startNodeId = resolveGraphId(body.startNodeId, "StartNodeId")
            }
            if (body.endNodeId !== undefined) {
                body.endNodeId = resolveGraphId(body.endNodeId, "EndNodeId")
            }
            return replaceRelationshipGraphId(await edit.editRelationship(id.id, body))
        },
        async removeNode(id: GraphId): Promise<void> {
            assertDispatcherGraphId(id)
            const {edit} = getSuite(id.suite)
            return edit.removeNode(id.id)
        },
        async removeRelationship(id: GraphId): Promise<void> {
            assertDispatcherGraphId(id)
            const {edit} = getSuite(id.suite)
            return edit.removeRelationship(id.id)
        },
    }
}


export function createTypeDispatcherGraphMeta(
    {
        getNodeSuite,
        getNodeTypes,
        getRelationshipTypes,
    }: InternalOp): Partial<GraphMeta> {
    return {
        async getNodeTypes(): Promise<string[]> {
            return getNodeTypes()
        },
        async getRelationshipTypes(): Promise<string[]> {
            return getRelationshipTypes()
        },
        async getNodeCellMeta(type: string): Promise<GraphNodeCellMeta> {
            const {meta} = getNodeSuite(type)
            return await meta.getNodeCellMeta(type)
        },
        async getNodeDetailsMeta(type: string): Promise<GraphNodeDetailsMeta> {
            const {meta} = getNodeSuite(type)
            return await meta.getNodeDetailsMeta(type)
        }
    }
}
