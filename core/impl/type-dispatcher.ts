import type {GraphEdit, GraphNodeBody, GraphRelationshipBody} from "../graph-edit.ts";
import type {GraphId} from "../graph-id.ts";
import {createDefaultGraphMeta, type GraphMeta} from "../graph-meta.ts";
import type {GraphSuite} from "../graph-suite.ts";
import type {Graph, GraphNode, GraphRelationship} from "../graph.ts";
import {separateNodeSearcherByTypes} from "../node-searcher.ts";
import {matchAllSearcher, typeSearcher} from "../searcher.ts";

export interface TypeDispatcherConfiguration {
    suites: Record<string, GraphSuite>
    nodeTypes: Record<string, string>
    relationshipTypes: Record<string, string>
}

export interface DispatcherGraphId {
    suite: string,
    id: string,
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

    nodeTypesOfSuite(suiteId: string): string[],

    relationshipTypesOfSuite(suiteId: string): string[],

    getSuite(suiteId: string): InternalSuite

    getNodeSuite(type: string): InternalSuite

    getRelationshipSuite(type: string): InternalSuite

    getNodeTypes(): string[]

    getRelationshipTypes(): string[]
}

interface InternalSuite extends GraphSuite {
    id: string,

    replaceGraphId<T extends GraphNode | GraphRelationship>(entity: T): T,
}

function createInternalOp(
    {
        suites,
        nodeTypes,
        relationshipTypes,
    }: TypeDispatcherConfiguration): InternalOp {

    function replaceGraphId<T extends GraphNode | GraphRelationship>(suiteId: string, entity: T): T {
        entity.id = {
            suite: suiteId,
            id: entity.id,
        }
        return entity
    }

    function getSuite(suiteId: string): InternalSuite {
        const suite = suites[suiteId]
        if (suite !== undefined) {
            return {
                ...suite,
                id: suiteId,
                replaceGraphId<T extends GraphNode | GraphRelationship>(entity: T): T {
                    return replaceGraphId(suiteId, entity)
                }
            }
        }
        throw new Error(`Unknown suite ${suiteId}`)
    }

    return {
        suiteIds() {
            return Object.keys(suites)
        },
        nodeTypesOfSuite(suiteId: string): string[] {
            return Object.entries(nodeTypes)
                .filter(([_, s]) => s == suiteId)
                .map(([t, _]) => t)
        },
        relationshipTypesOfSuite(suiteId: string): string[] {
            return Object.entries(relationshipTypes)
                .filter(([_, s]) => s == suiteId)
                .map(([t, _]) => t)
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

export function createTypeDispatcherGraph({suiteIds, nodeTypesOfSuite, getSuite, getNodeSuite}: InternalOp): Graph {
    return {
        async getNode(id): Promise<GraphNode | null> {
            assertDispatcherGraphId(id)
            const {graph, replaceGraphId} = getSuite(id.suite)
            const node = await graph.getNode(id.id)
            if (node == null) {
                return null
            }
            return replaceGraphId(node)
        },
        async getRelationship(id): Promise<GraphRelationship | null> {
            assertDispatcherGraphId(id)
            const {graph, replaceGraphId} = getSuite(id.suite)
            const relationship = await graph.getRelationship(id.id)
            if (relationship == null) {
                return null
            }
            return replaceGraphId(relationship)
        },
        async searchNodes(searcher): Promise<GraphNode[]> {
            const searchers = separateNodeSearcherByTypes(searcher)
            let result: GraphNode[] = []
            switch (searchers.type) {
                case "ByType":
                    for (const [type, subSearcher] of Object.entries(searchers.data)) {
                        const {graph, replaceGraphId,} = getNodeSuite(type)
                        const items = await graph.searchNodes(matchAllSearcher([
                            typeSearcher(type), subSearcher,
                        ]))
                        result.push(...items.map(it => replaceGraphId(it)))
                    }
                    break
                default:
                case "AllTypes":
                    for (const suiteId of suiteIds()) {
                        const {graph, replaceGraphId} = getSuite(suiteId)
                        for (const type of nodeTypesOfSuite(suiteId)) {
                            const items = await graph.searchNodes(matchAllSearcher([
                                typeSearcher(type), searcher,
                            ]))
                            result.push(...items.map(it => replaceGraphId(it)))
                        }
                    }
                    break
            }
            return result
        },

        async searchRelationships(searcher): Promise<GraphRelationship[]> {
            const result: GraphRelationship[] = []
            for (const suiteId of suiteIds()) {
                const {graph, replaceGraphId} = getSuite(suiteId)
                const items = await graph.searchRelationships(searcher)
                result.push(...items.map(it => replaceGraphId(it)))
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
            const {edit, replaceGraphId} = getNodeSuite(node.type)
            return replaceGraphId(await edit.createNode(node))
        },
        async createRelationship(relationship: GraphRelationshipBody): Promise<GraphRelationship> {
            const {edit, replaceGraphId} = getRelationshipSuite(relationship.type)
            return replaceGraphId(await edit.createRelationship(relationship))
        },
        async editNode(id: GraphId, node: Partial<GraphNodeBody>): Promise<GraphNode> {
            assertDispatcherGraphId(id)
            const {edit, id: currentSuiteId, replaceGraphId} = getSuite(id.suite)
            if (node.type !== undefined) {
                const {id: afterSuiteId} = getNodeSuite(node.type)
                if (afterSuiteId != currentSuiteId) {
                    throw new Error(`Not allow change the type between suites, from ${currentSuiteId} to ${afterSuiteId}(${node.type})`)
                }
            }
            return replaceGraphId(await edit.editNode(id.id, node))
        },
        async editRelationship(id: GraphId, relationship: Partial<GraphRelationshipBody>): Promise<GraphRelationship> {
            assertDispatcherGraphId(id)
            const {edit, id: currentSuiteId, replaceGraphId} = getSuite(id.suite)
            if (relationship.type !== undefined) {
                const {id: afterSuiteId} = getRelationshipSuite(relationship.type)
                if (afterSuiteId != currentSuiteId) {
                    throw new Error(`Not allow change the type between suites, from ${currentSuiteId} to ${afterSuiteId}(${relationship.type})`)
                }
            }
            return replaceGraphId(await edit.editRelationship(id.id, relationship))
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
    }
}
