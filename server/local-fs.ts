import * as fs from "fs/promises";
import * as crypto from "node:crypto";
import type {FileHandle} from "node:fs/promises";
import * as path from "path";
import type {Graph, GraphEdit, GraphNode, GraphRelationship} from "../core"
import {checkNode, checkRelationship, NodeSearcher, RelationshipSearcher} from "../core"

export interface LocalFsConfiguration {
    path: string,
    idPrefix: string,
}

export async function createFromLocalFs(config: LocalFsConfiguration): Promise<[Graph, GraphEdit]> {
    const fsOperation = await createLocalFsOperation(config)
    const graph = createGraph(fsOperation)
    const graphEdit = createGraphEdit(graph, fsOperation)
    return [graph, graphEdit]
}


interface Nodes {
    data: GraphNode[]
}

interface Relationships {
    data: GraphRelationship[]
}

interface SourceMapping {
    "node": Nodes,
    "relationship": Relationships
}

type ItemSourceMapping<T extends keyof SourceMapping> = SourceMapping[T]["data"][0]

interface Id2Type {
    data: Record<string, string>
}

interface Types {
    data: string[]
}

interface LocalFsOperation {
    id2Type(source: keyof SourceMapping, id: string): Promise<string | null>

    randomId(source: keyof SourceMapping): Promise<string>

    types(source: keyof SourceMapping): Promise<string[]>

    read<T extends keyof SourceMapping>(source: T, type: string): Promise<SourceMapping[T]>

    write<T extends keyof SourceMapping>(source: T, type: string, data: SourceMapping[T]): Promise<void>

    modifyId2Type(source: keyof SourceMapping, id: string, type: string): Promise<void>

    removeId2Type(source: keyof SourceMapping, id: string): Promise<void>
}


export async function createLocalFsOperation(config: LocalFsConfiguration): Promise<LocalFsOperation> {
    const root = config.path
    const idPrefix = config.idPrefix

    // try to create root
    await fs.mkdir(root, {recursive: true})

    async function readJson<T>(name: string, defaultValue: T): Promise<T> {
        const fullPath = path.join(root, name)
        let handle: FileHandle | null = null
        try {
            handle = await fs.open(fullPath, "r")
            const content = await handle.readFile("utf8")
            return JSON.parse(content)
        } catch (err) {
            if ((err as any).code === 'ENOENT') {
                return defaultValue
            } else {
                throw err;
            }
        } finally {
            await handle?.close()
        }
    }

    async function writeJson<T>(name: string, content: T) {
        const fullPath = path.join(root, name)
        let handle: FileHandle | null = null
        try {
            handle = await fs.open(fullPath, "w")
            await handle.writeFile(JSON.stringify(content, null, 2), "utf8")
        } finally {
            await handle?.close()
        }
    }

    async function id2Type(source: "node" | "relationship", id: string): Promise<string | null> {
        const id2Type = await readJson<Id2Type>(`${source}.id2type.json`, {data: {}})
        const type = id2Type.data[id]
        if (type === undefined) {
            return null
        } else {
            return type
        }
    }

    async function randomId(_: keyof SourceMapping): Promise<string> {
        return `${idPrefix}${crypto.randomUUID()}`
    }

    async function types(source: keyof SourceMapping): Promise<string[]> {
        return (await readJson<Types>(`${source}.types.json`, {data: []})).data
    }


    async function read<T extends keyof SourceMapping>(source: T, type: string): Promise<SourceMapping[T]> {
        return await readJson<SourceMapping[T]>(`${type}.${source}.json`, {data: []})
    }

    async function write<T extends keyof SourceMapping>(source: T, type: string, data: SourceMapping[T]): Promise<void> {
        return await writeJson(`${type}.${source}.json`, data)
    }

    async function modifyId2Type(source: keyof SourceMapping, id: string, type: string): Promise<void> {
        const existedTypes = await readJson<Types>(`${source}.types.json`, {data: []})
        if (!existedTypes.data.includes(type)) {
            existedTypes.data.push(type)
            existedTypes.data.sort()
            await writeJson<Types>(`${source}.types.json`, existedTypes)
        }
        const id2Type = await readJson<Id2Type>(`${source}.id2type.json`, {data: {}})
        id2Type.data[id] = type
        await writeJson<Id2Type>(`${source}.id2type.json`, id2Type)
    }

    async function removeId2Type(source: keyof SourceMapping, id: string): Promise<void> {
        const id2Type = await readJson<Id2Type>(`${source}.id2type.json`, {data: {}})
        delete id2Type.data[id]
        await writeJson<Id2Type>(`${source}.id2type.json`, id2Type)
    }

    return {
        id2Type,
        randomId,
        types,
        read,
        write,
        modifyId2Type,
        removeId2Type,
    }
}

function mustFoundById<T extends keyof SourceMapping>(source: T, id: string, data: SourceMapping[T]): ItemSourceMapping<T> {
    for (const item of data.data) {
        if (item.id === id) {
            return item
        }
    }
    throw Error(`Not found ${source}`)
}

function mustRemoveById<T extends keyof SourceMapping>(source: T, id: string, data: SourceMapping[T]): ItemSourceMapping<T> {
    for (const item of data.data) {
        if (item.id === id) {
            data.data = data.data.filter(it => it !== item)
            return item
        }
    }
    throw Error(`Not found ${source}`)
}

function createGraph(op: LocalFsOperation): Graph {

    async function getNode(id: string): Promise<GraphNode | null> {
        const type = await op.id2Type("node", id)
        if (type === null) {
            return null
        }
        return mustFoundById("node", id, await op.read("node", type))
    }

    async function searchNodes(searcher: NodeSearcher): Promise<GraphNode[]> {
        let types = collectSearcherTypes(searcher)
        if (types === null) {
            types = await op.types("node")
        }
        if (types.length === 0) {
            return []
        }
        const result: GraphNode[] = []
        for (const type of types) {
            const nodes = await op.read("node", type)
            for (const node of Object.values(nodes.data)) {
                if (checkNode(node, searcher)) {
                    result.push(node)
                }
            }
        }
        return result
    }

    async function getRelationship(id: string): Promise<GraphRelationship | null> {
        const type = await op.id2Type("relationship", id)
        if (type === null) {
            return null
        }
        return mustFoundById("relationship", id, await op.read("relationship", type))
    }

    async function searchRelationships(searcher: RelationshipSearcher): Promise<GraphRelationship[]> {
        let types = collectSearcherTypes(searcher)
        if (types === null) {
            types = await op.types("relationship")
        }
        if (types.length === 0) {
            return []
        }
        const result: GraphRelationship[] = []
        for (const type of types) {
            const relationships = await op.read("relationship", type)
            for (const relationship of Object.values(relationships.data)) {
                if (checkRelationship(relationship, searcher)) {
                    result.push(relationship)
                }
            }
        }
        return result
    }

    return {
        getNode,
        searchNodes,
        getRelationship,
        searchRelationships,
    }
}

export function collectSearcherTypes(searcher: NodeSearcher | RelationshipSearcher): string[] | null {
    switch (searcher.type) {
        case "type":
            return [searcher.value]
        case "and":
            let result: string[] | null = null
            for (const s of searcher.searchers) {
                const child = collectSearcherTypes(s)
                if (child === null) {
                    continue
                }
                if (result === null) {
                    result = child
                    continue
                }
                result = result.filter(it => child.includes(it))
            }
            return result
        default:
            return null
    }
}


function createGraphEdit(graph: Graph, op: LocalFsOperation): GraphEdit {

    function now(): string {
        return new Date().toISOString()
    }

    async function newEmptyNode(): Promise<GraphNode> {
        const id = await op.randomId("node")
        const nodes = await op.read("node", "New")
        const result = {
            id: id,
            type: "New",
            properties: {},
            createTime: now(),
            updateTime: now(),
        }
        nodes.data.push(result)
        await op.write("node", "New", nodes)
        await op.modifyId2Type("node", id, "New")
        return result
    }

    async function editType<T extends keyof SourceMapping>(source: T, id: string, type: string): Promise<ItemSourceMapping<T>> {
        const previousType = (await op.id2Type(source, id))!
        if (type === previousType) {
            if (source === "node") {
                return (await graph.getNode(id))!
            } else {
                return (await graph.getRelationship(id))!
            }
        }
        const listPreviousType = await op.read(source, previousType)
        const item = mustRemoveById(source, id, listPreviousType)
        await op.write(source, previousType, listPreviousType)
        item.type = type
        item.updateTime = now()
        const list = await op.read(source, type)
        // @ts-ignore The type is safe here
        list.data.push(item)
        await op.write(source, type, list)
        await op.modifyId2Type(source, id, type)
        return item
    }

    async function editNodeType(id: string, type: string): Promise<GraphNode> {
        return editType("node", id, type)
    }

    async function editFields<T extends keyof SourceMapping>(source: T, id: string, set: (item: ItemSourceMapping<T>) => void): Promise<ItemSourceMapping<T>> {
        const type = (await op.id2Type(source, id))!
        const data = await op.read(source, type)
        const item = mustFoundById(source, id, data)
        set(item)
        item.updateTime = now()
        await op.write(source, type, data)
        return item
    }

    async function editNodeProperty(id: string, properties: any): Promise<GraphNode> {
        return editFields("node", id, item => {
            item.properties = properties
        })
    }

    async function remove(source: keyof SourceMapping, id: string,) {
        const type = (await op.id2Type(source, id))!
        const nodes = await op.read(source, type)
        mustRemoveById(source, id, nodes)
        await op.write(source, type, nodes)
        await op.removeId2Type(source, id)
    }

    async function removeNode(id: string): Promise<void> {
        await remove("node", id)
    }


    async function copy<T extends keyof SourceMapping>(source: T, id: string): Promise<ItemSourceMapping<T>> {
        const newId = await op.randomId(source);
        const type = (await op.id2Type(source, id))!
        const data = await op.read(source, type)
        const item = mustFoundById(source, id, data)
        const newItem = {
            ...item,
            id: newId,
            createTime: now(),
            updateTime: now(),
        }
        // @ts-ignore The type is safe here
        data.data.push(newItem)
        await op.write(source, type, data)
        await op.modifyId2Type(source, newId, type)
        return newItem
    }

    async function copyNode(id: string): Promise<GraphNode> {
        return await copy("node", id)
    }

    async function newEmptyRelationship(startNodeId: string, endNodeId: string): Promise<GraphRelationship> {
        const id = await op.randomId("relationship")
        const relationships = await op.read("relationship", "New")
        const result = {
            id: id,
            type: "New",
            startNodeId: startNodeId,
            endNodeId: endNodeId,
            properties: {},
            createTime: now(),
            updateTime: now(),
        }
        relationships.data.push(result)
        await op.write("relationship", "New", relationships)
        await op.modifyId2Type("relationship", id, "New")
        return result
    }

    async function editRelationshipType(id: string, type: string): Promise<GraphRelationship> {
        return editType("relationship", id, type)
    }

    async function editRelationshipStartNode(id: string, nodeId: string): Promise<GraphRelationship> {
        return editFields("relationship", id, item => {
            item.startNodeId = nodeId
        })
    }

    async function editRelationshipEndNode(id: string, nodeId: string): Promise<GraphRelationship> {
        return editFields("relationship", id, item => {
            item.endNodeId = nodeId
        })
    }

    async function editRelationshipProperty(id: string, properties: any): Promise<GraphRelationship> {
        return editFields("relationship", id, item => {
            item.properties = properties
        })
    }

    async function removeRelationship(id: string): Promise<void> {
        await remove("relationship", id)
    }

    async function copyRelationship(id: string): Promise<GraphRelationship> {
        return copy("relationship", id)
    }

    return {
        newEmptyNode,
        editNodeType,
        editNodeProperty,
        removeNode,
        copyNode,
        newEmptyRelationship,
        editRelationshipType,
        editRelationshipStartNode,
        editRelationshipEndNode,
        editRelationshipProperty,
        removeRelationship,
        copyRelationship,
    }
}

/*
Keep this design simple and then move it to tabolo

ID is random uuid with a prefix.
- No other info needs to be extract from ID.
- The ID is not ordered. Only the equality is meaningful.
- The random uuid will use timestamp to avoid conflict.
Each type use a JSON file.
- Avoid too many JSON files if each node or relationship has a file
A JSON file for ID->Type mapping
- Help to find the file without use too many reads.
- Also help to check ID conflict.
 */