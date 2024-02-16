import * as fs from "fs/promises";
import * as crypto from "node:crypto";
import type {FileHandle} from "node:fs/promises";
import * as path from "path";
import {
    checkNode,
    checkRelationship,
    createDefaultGraphMeta,
    type Graph,
    type GraphEdit,
    type GraphId,
    type GraphMeta,
    type GraphNode,
    type GraphRelationship,
    type GraphSuite,
    isSameGraphId,
    NodeSearcher,
    NodeType,
    RelationshipSearcher,
    typeSearcher
} from "../core"

export interface LocalFsConfiguration {
    path: string,
    idPrefix: string,
}

export async function createFromLocalFs(config: LocalFsConfiguration): Promise<GraphSuite> {
    const fsOperation = await createLocalFsOperation(config)
    const markdownExtension = createMarkdownExtension(fsOperation)
    const graph = createGraph(fsOperation, [markdownExtension])
    const edit = createGraphEdit(fsOperation, [markdownExtension])
    const meta = createGraphMeta(graph, fsOperation)
    return {graph, edit, meta}
}

interface NodeExtension {
    type: string[],

    reReadNode(properties: any, node: GraphNode): Promise<any>

    reWriteNode(properties: any, node: GraphNode): Promise<any>
}

function createMarkdownExtension(op: LocalFsOperation): NodeExtension {
    return {
        type: ["Markdown"],

        async reReadNode(properties: any): Promise<any> {
            const content = await op.readRaw(properties.path)
            return {
                ...properties,
                "content": content,
            }
        },

        async reWriteNode(properties: any): Promise<any> {
            await op.writeRaw(properties.path, properties.content)
            const newProperties = {...properties}
            delete newProperties.content
            return newProperties;
        }
    }
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
    id2Type(source: keyof SourceMapping, id: GraphId): Promise<string | null>

    randomId(source: keyof SourceMapping): Promise<GraphId>

    types(source: keyof SourceMapping): Promise<string[]>

    read<T extends keyof SourceMapping>(source: T, type: string): Promise<SourceMapping[T]>

    write<T extends keyof SourceMapping>(source: T, type: string, data: SourceMapping[T]): Promise<void>

    modifyId2Type(source: keyof SourceMapping, id: GraphId, type: string): Promise<void>

    removeId2Type(source: keyof SourceMapping, id: GraphId): Promise<void>

    readRaw(path: string): Promise<string | null>

    writeRaw(path: string, content: string): Promise<void>
}


export async function createLocalFsOperation(config: LocalFsConfiguration): Promise<LocalFsOperation> {
    const root = config.path
    const idPrefix = config.idPrefix

    // try to create root
    await fs.mkdir(root, {recursive: true})

    async function readRaw(file: string): Promise<string | null> {
        const fullPath = path.join(root, file)
        let handle: FileHandle | null = null
        try {
            handle = await fs.open(fullPath, "r")
            return await handle.readFile("utf8")
        } catch (err) {
            if ((err as any).code === 'ENOENT') {
                return null
            } else {
                throw err;
            }
        } finally {
            await handle?.close()
        }
    }

    async function writeRaw(file: string, content: string): Promise<void> {
        const fullPath = path.join(root, file)
        let handle: FileHandle | null = null
        try {
            handle = await fs.open(fullPath, "w")
            await handle.writeFile(content, "utf8")
        } finally {
            await handle?.close()
        }
    }

    async function readJson<T>(name: string, defaultValue: T): Promise<T> {
        const content = await readRaw(name)
        return content === null ? defaultValue : JSON.parse(content)
    }

    async function writeJson<T>(name: string, content: T) {
        return writeRaw(name, JSON.stringify(content, null, 2));
    }

    async function id2Type(source: "node" | "relationship", id: GraphId): Promise<string | null> {
        const id2Type = await readJson<Id2Type>(`${source}.id2type.json`, {data: {}})
        let searchKey: string;
        if (typeof id !== "string") {
            searchKey = JSON.stringify(id)
        } else {
            searchKey = id
        }
        const type = id2Type.data[searchKey]
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
        readRaw,
        writeRaw,
    }
}

function mustFoundById<T extends keyof SourceMapping>(source: T, id: GraphId, data: SourceMapping[T]): ItemSourceMapping<T> {
    for (const item of data.data) {
        if (isSameGraphId(item.id, id)) {
            return item
        }
    }
    throw Error(`Not found ${source}`)
}

function mustRemoveById<T extends keyof SourceMapping>(source: T, id: GraphId, data: SourceMapping[T]): void {
    for (const item of data.data) {
        if (isSameGraphId(item.id, id)) {
            data.data = data.data.filter(it => it !== item)
            return
        }
    }
    throw Error(`Not found ${source} of ${JSON.stringify(id)}`)
}

function createGraph(op: LocalFsOperation, nodeExtensions: NodeExtension[]): Graph {

    async function postReadNode(node: GraphNode): Promise<GraphNode> {
        let result: GraphNode = {
            ...node,
        }
        for (const e of nodeExtensions) {
            if (e.type.includes(node.type)) {
                result.properties = await e.reReadNode(result.properties, node)
            }
        }
        return result
    }

    return {
        async getNode(id): Promise<GraphNode | null> {
            const type = await op.id2Type("node", id)
            if (type === null) {
                return null
            }
            return await postReadNode(mustFoundById("node", id, await op.read("node", type)))
        },
        async searchNodes(searcher): Promise<GraphNode[]> {
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
                        result.push(await postReadNode(node))
                    }
                }
            }
            return result
        },
        async getRelationship(id): Promise<GraphRelationship | null> {
            const type = await op.id2Type("relationship", id)
            if (type === null) {
                return null
            }
            return mustFoundById("relationship", id, await op.read("relationship", type))
        },
        async searchRelationships(searcher): Promise<GraphRelationship[]> {
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
        },
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


function createGraphEdit(op: LocalFsOperation, nodeExtensions: NodeExtension[]): GraphEdit {

    function now(): string {
        return new Date().toISOString()
    }

    async function preWriteNode(node: GraphNode, properties: any): Promise<any> {
        let result = properties
        for (const e of nodeExtensions) {
            if (e.type.includes(node.type)) {
                result = await e.reWriteNode(result, node)
            }
        }
        return result
    }

    async function remove(source: keyof SourceMapping, id: GraphId) {
        const type = (await op.id2Type(source, id))!
        const items = await op.read(source, type)
        mustRemoveById(source, id, items)
        await op.write(source, type, items)
        await op.removeId2Type(source, id)
    }

    async function edit<T extends keyof SourceMapping>(
        source: T, id: GraphId,
        type: string | undefined,
        set: (item: ItemSourceMapping<T>) => Promise<void> | void,
    ): Promise<ItemSourceMapping<T>> {
        const previousType = (await op.id2Type(source, id))!
        const previousItems = await op.read(source, previousType)
        const item = mustFoundById(source, id, previousItems)
        let items: SourceMapping[T]
        let currentType: string
        if (type !== undefined && previousType !== type) {
            mustRemoveById(source, id, previousItems)
            await op.write(source, previousType, previousItems)
            await op.modifyId2Type(source, id, type)
            items = await op.read(source, type)
            // @ts-ignore The type is safe here
            items.data.push(item)
            item.type = type
            currentType = type
        } else {
            items = previousItems
            currentType = previousType
        }
        await set(item)
        item.updateTime = now()
        await op.write(source, currentType, items)
        return item
    }

    return {
        async createNode({type, properties}): Promise<GraphNode> {
            const id = await op.randomId("node")
            const nodes = await op.read("node", type)
            const result: GraphNode = {
                id,
                type,
                properties,
                createTime: now(),
                updateTime: now(),
            }
            nodes.data.push(result)
            await op.write("node", type, nodes)
            await op.modifyId2Type("node", id, type)
            return result
        },
        async editNode(id, {type, properties}): Promise<GraphNode> {
            return edit("node", id, type, async (item) => {
                if (properties !== undefined) {
                    item.properties = await preWriteNode(item, properties)
                }
            })
        },
        async removeNode(id): Promise<void> {
            await remove("node", id)
        },
        async createRelationship({type, properties, startNodeId, endNodeId,}): Promise<GraphRelationship> {
            const id = await op.randomId("node")
            const relationships = await op.read("relationship", type)
            const result: GraphRelationship = {
                id,
                type,
                properties,
                startNodeId,
                endNodeId,
                createTime: now(),
                updateTime: now(),
            }
            relationships.data.push(result)
            await op.write("relationship", type, relationships)
            await op.modifyId2Type("relationship", id, type)
            return result
        },
        async editRelationship(id, {type, properties, startNodeId, endNodeId,}): Promise<GraphRelationship> {
            return edit("relationship", id, type, async (item) => {
                if (properties !== undefined) {
                    item.properties = properties
                }
                if (startNodeId !== undefined) {
                    item.startNodeId = startNodeId
                }
                if (endNodeId !== undefined) {
                    item.endNodeId = endNodeId
                }
            })
        },
        async removeRelationship(id): Promise<void> {
            await remove("relationship", id)
        },
    }
}

function createGraphMeta(graph: Graph, fsOperation: LocalFsOperation): GraphMeta {
    return {
        ...createDefaultGraphMeta(graph),
        async getNodeTypes() {
            const types = new Set<string>();
            for (const typeNode of (await graph.searchNodes(typeSearcher(NodeType)))) {
                types.add(typeNode.properties.name);
            }
            for (const typeInFiles of await fsOperation.types("node")) {
                types.add(typeInFiles)
            }
            const sorted = [...types]
            sorted.sort()
            return sorted
        },
        async getRelationshipTypes() {
            return await fsOperation.types("relationship")
        }
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