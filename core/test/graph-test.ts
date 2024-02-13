import {describe, expect, test} from "vitest";
import type {GraphNodeBody, GraphRelationshipBody} from "../graph-edit.ts";
import type {GraphSuite} from "../graph-suite.ts";
import type {GraphNode, GraphRelationship} from "../graph.ts";
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
     * Types for test usage
     */
    types: [string, string],
}

export function defaultNodeTestConfig(): NodeTestConfig {
    return {
        types: ["Type 1", "Type 2"]
    }
}


export function verifyNode({graph, edit}: GraphSuite, {types}: NodeTestConfig) {
    function expectBody(node: GraphNode, body: GraphNodeBody) {
        expect(node.type).toBe(body.type)
        expect(node.properties).toStrictEqual(body.properties)
    }

    test("node operations", async () => {
        const [type1, type2] = types
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


    test("relationship operations", async () => {
        const [type1, type2] = relationshipTypes
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

}