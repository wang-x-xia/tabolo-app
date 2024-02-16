import {describe, expect, test} from "vitest";
import type {GraphNodeBody, GraphRelationshipBody} from "../graph-edit.ts";
import {isSameGraphId} from "../graph-id.ts";
import type {GraphSuite} from "../graph-suite.ts";
import type {GraphNode, GraphRelationship, GraphResource} from "../graph.ts";
import {relationshipNodeSearcher} from "../relationship-searcher.ts";
import {
    alwaysFalseSearcher,
    alwaysTrueSearcher,
    matchAllSearcher,
    matchAnySearcher,
    notSearcher,
    propertySearcher,
    typeSearcher
} from "../searcher.ts";
import properties1 from "./test_properties_1.json" assert {type: "json"}
import properties2 from "./test_properties_2.json" assert {type: "json"}


export interface GraphTestConfig {
    node: NodeTestConfig,
    relationship: RelationshipTestConfig,
}

export function defaultTestConfig() {
    return {
        node: defaultNodeTestConfig(),
        relationship: defaultRelationshipTestConfig(),
    }
}

export function verifyGraph(suite: GraphSuite, {node, relationship}: GraphTestConfig = defaultTestConfig()) {
    describe("verify node operation", () => {
        verifyNode(suite, node)
    })
    describe("verify relationship operation", () => {
        verifyRelationship(suite, relationship)
    })
}

export interface NodeTestConfig {
    /**
     * Types for test usage, must be different
     */
    types: [string, string],
}

export function defaultNodeTestConfig(): NodeTestConfig {
    return {
        types: ["Type 1", "Type 2"]
    }
}

/**
 * Expected all results contains the expected node
 */
function assertAllResults<T extends GraphResource>(resources: T[], resourceNotes: string[]) {
    if (resources.length != resourceNotes.length) {
        throw new Error(`Different length of resources and notes ${resources.length} != ${resourceNotes.length}`)
    }
    return {
        expect(result: T[], message: string) {
            return {
                has(expected: T[]) {
                    function find(resource: T, list: T[]): T | null {
                        for (const item of list) {
                            if (isSameGraphId(item.id, resource.id)) {
                                return item
                            }
                        }
                        return null
                    }

                    for (let i = 0; i < resources.length; i++) {
                        const resource = resources[i]
                        const note = resourceNotes[i]
                        const valueInResult = find(resource, result)
                        if (valueInResult === null) {
                            //  not in result
                            if (find(resource, expected) === null) {
                                // not in expected
                            } else {
                                // but in expected
                                expect.fail(result, [resource], `${message}, ${note} should in result`)
                            }
                        } else {
                            // in result
                            if (find(resource, expected) !== null) {
                                // in expected
                                // check result
                                expect(valueInResult, `${message}, ${note} check data`).toStrictEqual(resource)
                            } else {
                                // but not in expected
                                expect.fail(result, expected, `${message}, ${note} shouldn't in result`)
                            }
                        }
                    }
                }
            }
        }
    }
}


export function verifyNode({graph, edit}: GraphSuite, {types}: NodeTestConfig) {
    function expectBody(node: GraphNode, body: GraphNodeBody) {
        expect(node.type).toBe(body.type)
        expect(node.properties).toStrictEqual(body.properties)
    }

    const [type1, type2] = types

    test("node operations", async () => {
        let node = await edit.createNode({type: type1, properties: properties1})
        const id = node.id
        expectBody(node, {type: type1, properties: properties1})

        node = await edit.editNode(id, {type: type2})
        expect(node.id).toStrictEqual(id)
        expectBody(node, {type: type2, properties: properties1})
        expect(await graph.getNode(id), "Check after modify type").toStrictEqual(node)

        node = await edit.editNode(id, {properties: properties2})
        expect(node.id).toStrictEqual(id)
        expectBody(node, {type: type2, properties: properties2})
        expect(await graph.getNode(id), "Check after modify property").toStrictEqual(node)

        node = await edit.editNode(id, {type: type1, properties: properties1})
        expect(node.id).toStrictEqual(id)
        expectBody(node, {type: type1, properties: properties1})
        expect(await graph.getNode(id), "Check after modify type and property").toStrictEqual(node)

        await edit.removeNode(id)
        expect(await graph.getNode(id), "After remove node").toBeNull()
    })

    test("node searchers", async () => {
        await testCommonAndLogicSearcher(
            async (type, properties) => await edit.createNode({type, properties}),
            graph.searchNodes, type1, type2,
        )
    })
}


export interface RelationshipTestConfig {
    nodeType: string,
    relationshipTypes: [string, string]
}


export function defaultRelationshipTestConfig(): RelationshipTestConfig {
    return {
        nodeType: "Type",
        relationshipTypes: ["Type 1", "Type 2"]
    }
}


export function verifyRelationship(
    {graph, edit}: GraphSuite,
    {nodeType, relationshipTypes}: RelationshipTestConfig) {

    function expectBody(relationship: GraphRelationship, body: GraphRelationshipBody) {
        expect(relationship.type).toBe(body.type)
        expect(relationship.properties).toStrictEqual(body.properties)
        expect(relationship.startNodeId).toStrictEqual(body.startNodeId)
        expect(relationship.endNodeId).toStrictEqual(body.endNodeId)
    }

    const [type1, type2] = relationshipTypes

    test("relationship operations", async () => {
        const startNode1 = await edit.createNode({type: nodeType, properties: properties1})
        const startNode2 = await edit.createNode({type: nodeType, properties: properties2})
        expect(startNode1.id).not.toStrictEqual(startNode2.id)
        const endNode1 = await edit.createNode({type: nodeType, properties: properties1})
        const endNode2 = await edit.createNode({type: nodeType, properties: properties2})
        expect(endNode1.id).not.toStrictEqual(endNode2.id)

        let relationship = await edit.createRelationship({
            type: type1,
            properties: properties1,
            startNodeId: startNode1.id,
            endNodeId: endNode1.id,
        });
        const id = relationship.id
        expectBody(relationship, {
            type: type1,
            properties: properties1,
            startNodeId: startNode1.id,
            endNodeId: endNode1.id,
        })
        expect(await graph.getRelationship(id), "Check query").toStrictEqual(relationship)

        relationship = await edit.editRelationship(id, {type: type2})
        expectBody(relationship, {
            type: type2,
            properties: properties1,
            startNodeId: startNode1.id,
            endNodeId: endNode1.id,
        })
        expect(await graph.getRelationship(id), "Check after modify type").toStrictEqual(relationship)

        relationship = await edit.editRelationship(id, {properties: properties2})
        expectBody(relationship, {
            type: type2,
            properties: properties2,
            startNodeId: startNode1.id,
            endNodeId: endNode1.id,
        })
        expect(await graph.getRelationship(id), "Check after modify property").toStrictEqual(relationship)

        relationship = await edit.editRelationship(id, {startNodeId: startNode2.id})
        expectBody(relationship, {
            type: type2,
            properties: properties2,
            startNodeId: startNode2.id,
            endNodeId: endNode1.id,
        })
        expect(await graph.getRelationship(id), "Check after modify start node").toStrictEqual(relationship)

        relationship = await edit.editRelationship(id, {endNodeId: endNode2.id})
        expectBody(relationship, {
            type: type2,
            properties: properties2,
            startNodeId: startNode2.id,
            endNodeId: endNode2.id,
        })
        expect(await graph.getRelationship(id), "Check after modify end node").toStrictEqual(relationship)

        relationship = await edit.editRelationship(id, {
            type: type1,
            properties: properties1,
            startNodeId: startNode1.id,
            endNodeId: endNode1.id,
        })
        expectBody(relationship, {
            type: type1,
            properties: properties1,
            startNodeId: startNode1.id,
            endNodeId: endNode1.id,
        })
        expect(await graph.getRelationship(id), "Check after modify end node").toStrictEqual(relationship)

        await edit.removeRelationship(id)
        expect(await graph.getRelationship(id), "After remove relationship").toBeNull()
    })

    test("relationship common/logic searchers", async () => {
        const startNode = await edit.createNode({type: nodeType, properties: properties1})
        const endNode = await edit.createNode({type: nodeType, properties: properties2})

        await testCommonAndLogicSearcher(
            async (type, properties) => await edit.createRelationship({
                type, properties,
                startNodeId: startNode.id, endNodeId: endNode.id,
            }),
            graph.searchRelationships, type1, type2)
    })

    test("relationship node searchers", async () => {
        const node1 = await edit.createNode({type: nodeType, properties: properties1})
        const node2 = await edit.createNode({type: nodeType, properties: properties2})

        const r11 = await edit.createRelationship({
            type: type1,
            properties: properties1,
            startNodeId: node1.id,
            endNodeId: node1.id,
        })
        const r12 = await edit.createRelationship({
            type: type1,
            properties: properties1,
            startNodeId: node1.id,
            endNodeId: node2.id,
        })
        const r21 = await edit.createRelationship({
            type: type1,
            properties: properties1,
            startNodeId: node2.id,
            endNodeId: node1.id,
        })
        const r22 = await edit.createRelationship({
            type: type1,
            properties: properties1,
            startNodeId: node2.id,
            endNodeId: node2.id,
        })


        const all = assertAllResults(
            [r11, r12, r21, r22],
            ["1->1", "1->2", "2->1", "2->2"])

        all.expect(await graph.searchRelationships(relationshipNodeSearcher(node1.id, "start")), "Node1 at start")
            .has([r11, r12])
        all.expect(await graph.searchRelationships(relationshipNodeSearcher(node1.id, "end")), "Node1 at end")
            .has([r11, r21])
        all.expect(await graph.searchRelationships(relationshipNodeSearcher(node1.id, "both")), "Node1 at start or end")
            .has([r11, r12, r21])

        all.expect(await graph.searchRelationships(matchAllSearcher([
            relationshipNodeSearcher(node1.id, "start"),
            relationshipNodeSearcher(node2.id, "end"),
        ])), "Node1 -> Node2")
            .has([r12])

        all.expect(await graph.searchRelationships(matchAnySearcher([
            relationshipNodeSearcher(node1.id, "start"),
            relationshipNodeSearcher(node2.id, "end"),
        ])), "Node1 -> Node2")
            .has([r11, r12, r22])
    })
}


async function testCommonAndLogicSearcher<T extends GraphResource>(
    creator: (type: string, properties: any) => Promise<T>,
    searcher: (s: any) => Promise<T[]>, type1: string, type2: string,
) {
    const t1p1 = await creator(type1, properties1)
    const t1p2 = await creator(type1, properties2)
    const t2p1 = await creator(type2, properties1)
    const t2p2 = await creator(type2, properties2)

    const all = assertAllResults(
        [t1p1, t1p2, t2p1, t2p1],
        ["(Type1 + Prop1)", "(Type1 + Prop2)", "(Type2 + Prop1)", "(Type2 + Prop2)"],
    )

    all.expect(await searcher(alwaysTrueSearcher()), "Search all")
        .has([t1p1, t1p2, t2p1, t2p2])

    all.expect(await searcher(alwaysFalseSearcher()), "Search none")
        .has([])

    all.expect(await searcher(typeSearcher(type1)), "Search by Type1")
        .has([t1p1, t1p2])

    all.expect(await searcher(typeSearcher(type2)), "Search by Type2")
        .has([t2p1, t2p2])

    all.expect(await searcher(propertySearcher("$.name", "John Doe")),
        "Search Prop1")
        .has([t1p1, t2p1])

    all.expect(await searcher(matchAllSearcher([
        typeSearcher(type1),
        propertySearcher("$.name", "John Doe"),
    ])), "Search by Type1 and Prop1")
        .has([t1p1])

    all.expect(await searcher(matchAnySearcher([
        typeSearcher(type1),
        propertySearcher("$.name", "John Doe"),
    ])), "Search by Type1 or Prop1")
        .has([t1p1, t1p2, t2p1])

    all.expect(await searcher(notSearcher(typeSearcher(type1))), "Search by no Type1")
        .has([t2p1, t2p2])
}
