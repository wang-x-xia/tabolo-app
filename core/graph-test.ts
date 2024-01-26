import type {Graph} from "./graph";
import type {GraphEdit} from "./graph-edit";
import {describe, expect, test} from "vitest";


export function verifyGraph(graph: Graph, graphEdit: GraphEdit) {
    describe("verify node operation", () => {
        verifyNode(graph, graphEdit)
    })
    describe("verify relationship operation", () => {
        verifyRelationship(graph, graphEdit)
    })
}

export function verifyNode(graph: Graph, graphEdit: GraphEdit) {
    test("node operations", async () => {
        let node = await graphEdit.newEmptyNode()
        const id = node.id
        expect(id).toBeTypeOf("string")
        expect(await graph.getNode(id), "Check query").toStrictEqual(node)

        node = await graphEdit.editNodeType(id, "Type")
        expect(node.id).toBe(id)
        expect(node.type).toBe("Type")
        expect(await graph.getNode(id), "Check after modify type").toStrictEqual(node)

        node = await graphEdit.editNodeProperty(id, {"test": "node ops"})
        expect(node.id).toBe(id)
        expect(node.properties).toStrictEqual({"test": "node ops"})
        expect(await graph.getNode(id), "Check after modify property").toStrictEqual(node)

        await graphEdit.removeNode(id)
        expect(await graph.getNode(id), "After remove node").toBeNull()
    })

    test("node copy", async () => {
        const node = await graphEdit.newEmptyNode()
        const id = node.id
        await graphEdit.editNodeType(id, "Type")
        await graphEdit.editNodeProperty(id, {"test": "node copy"})

        let copiedNode = await graphEdit.copyNode(id)
        const copiedId = copiedNode.id
        expect(copiedNode.id).not.toBe(id)
        expect(copiedNode.type).toBe("Type")
        expect(copiedNode.properties).toStrictEqual({"test": "node copy"})
        expect(await graph.getNode(copiedId), "Check copied node").toStrictEqual(copiedNode)

        await graphEdit.removeNode(copiedId)
        expect(await graph.getNode(copiedId), "After remove copied node").toBeNull()
    })
}

export function verifyRelationship(graph: Graph, graphEdit: GraphEdit) {
    test("relationship operations", async () => {
        const startNode = await graphEdit.newEmptyNode()
        const endNode = await graphEdit.newEmptyNode()

        let relationship = await graphEdit.newEmptyRelationship(startNode.id, endNode.id);
        const id = relationship.id
        expect(id).toBeTypeOf("string")
        expect(relationship.startNodeId).toBe(startNode.id)
        expect(relationship.endNodeId).toBe(endNode.id)
        expect(await graph.getRelationship(id), "Check query").toStrictEqual(relationship)

        relationship = await graphEdit.editRelationshipType(id, "Type")
        expect(relationship.id).toBe(id)
        expect(relationship.type).toBe("Type")
        expect(await graph.getRelationship(id), "Check after modify type").toStrictEqual(relationship)

        const newStartNode = await graphEdit.newEmptyNode()
        relationship = await graphEdit.editRelationshipStartNode(id, newStartNode.id)
        expect(relationship.startNodeId).toBe(newStartNode.id)
        expect(await graph.getRelationship(id), "Check after modify start node").toStrictEqual(relationship)

        const newEndNode = await graphEdit.newEmptyNode()
        relationship = await graphEdit.editRelationshipEndNode(id, newEndNode.id)
        expect(relationship.endNodeId).toBe(newEndNode.id)
        expect(await graph.getRelationship(id), "Check after modify end node").toStrictEqual(relationship)

        relationship = await graphEdit.editRelationshipProperty(id, {"test": "relationship op"})
        expect(relationship.properties).toStrictEqual({"test": "relationship op"})
        expect(await graph.getRelationship(id), "Check after modify property").toStrictEqual(relationship)

        await graphEdit.removeRelationship(id)
        expect(await graph.getRelationship(id), "After remove relationship").toBeNull()
    })

}