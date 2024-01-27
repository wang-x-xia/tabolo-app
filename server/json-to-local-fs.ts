import type {GraphNode, GraphRelationship} from "../core";
import data from "../ui/assets/Tabolo.json" assert {type: "json"};
import {createLocalFsOperation} from "./local-fs.ts";

(async function () {
    const {node, relationship} = data

    const localFsOperation = await createLocalFsOperation({path: "./tabolo", idPrefix: ""})

    const typedNodes = new Map<string, GraphNode[]>()
    const typedRelationship = new Map<string, GraphRelationship[]>()

    for (const n of node as GraphNode[]) {
        if (!typedNodes.has(n.type)) {
            typedNodes.set(n.type, [])
        }
        typedNodes.get(n.type)!.push(n)
        await localFsOperation.modifyId2Type("node", n.id, n.type)
    }

    for (const r of relationship as GraphRelationship[]) {
        if (!typedRelationship.has(r.type)) {
            typedRelationship.set(r.type, [])
        }
        typedRelationship.get(r.type)!.push(r)
        await localFsOperation.modifyId2Type("relationship", r.id, r.type)
    }

    const writeResult: Promise<void>[] = []

    typedNodes.forEach((data, type) => {
        writeResult.push(localFsOperation.write("node", type, {data}))
    })

    typedRelationship.forEach((data, type) => {
        writeResult.push(localFsOperation.write("relationship", type, {data}))
    })

    await Promise.all(writeResult)
})()