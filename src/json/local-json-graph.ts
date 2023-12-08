import type {Graph, GraphMeta, GraphNode, GraphNodeMeta, GraphRelationship} from "../data/graph";
import type {GraphEdit} from "../edit/graph-edit";
import type {NodeSearcher} from "../data/node-searcher";
import {checkNode} from "../data/node-searcher";
import {typeSearcher} from "../data/searcher";
import type {RelationshipSearcher} from "../data/relationship-searcher";
import {checkRelationship} from "../data/relationship-searcher";

export interface LocalJson {
    exportAll(): Promise<{ node: GraphNode[], relationship: GraphRelationship[] }>

    importAll(data: { node: GraphNode[], relationship: GraphRelationship[] }): Promise<void>
}

export async function createJsonKv(name: string): Promise<[Graph, GraphEdit, GraphMeta, LocalJson]> {
    let openDb = window.indexedDB.open(name);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
        openDb.onupgradeneeded = _ => {
            createNodeStore(openDb.result);
            createRelationshipStore(openDb.result);
        }
        openDb.onsuccess = _ => resolve(openDb.result)
        openDb.onerror = _ => reject(openDb.error)
    })

    let graph = createGraph(db)

    let graphEdit = createGraphEdit(db, graph)

    let graphMeta = createGraphMeta(graph)


    return [graph, graphEdit, graphMeta, createLocalJson(db)]
}

function createNodeStore(db: IDBDatabase) {
    if (!db.objectStoreNames.contains("node")) {
        db.createObjectStore("node", {keyPath: "id"})
            .createIndex("type", "type", {multiEntry: true, unique: false})
    }
}

function createRelationshipStore(db: IDBDatabase) {
    if (!db.objectStoreNames.contains("relationship")) {
        db.createObjectStore("relationship", {keyPath: "id"})
            .createIndex("type", "type", {unique: false})
    }
}

function createGraph(db: IDBDatabase): Graph {
    async function getValue(store: "node" | "relationship", id: string): Promise<any | null> {
        const objectStore = readStore(store, db);
        let key = await asPromise(objectStore.getKey(id));
        if (key === undefined) {
            return null
        }

        return await asPromise(objectStore.get(id))
    }

    async function getNode(id: string): Promise<GraphNode | null> {
        return await getValue("node", id)
    }

    return {
        getNode,

        async getNodes(ids: string[]): Promise<Record<string, GraphNode>> {
            const value: Record<string, GraphNode> = {}
            for (const id of ids) {
                let node = await getNode(id);
                if (node === null) {
                    value[id] = node
                }
            }
            return value
        },

        async searchNodes(searcher: NodeSearcher): Promise<GraphNode[]> {
            const nodes = await asPromise(readStore("node", db).getAll());
            return nodes.filter(it => checkNode(it, searcher));
        },

        async searchRelationships(searcher: RelationshipSearcher): Promise<GraphRelationship[]> {
            const relationships = await asPromise(readStore("relationship", db).getAll());
            return relationships.filter(it => checkRelationship(it, searcher));
        },
    }
}


function createGraphEdit(db: IDBDatabase, graph: Graph): GraphEdit {

    async function changeNode(id: string, cdc: (node: GraphNode) => "abort" | "commit"): Promise<GraphNode> {
        const [transaction, store] = writeStore("node", db)
        let node = await asPromise(store.get(id)) as GraphNode;
        try {
            if (cdc(node) == "commit") {
                await asPromise(store.put(node))
                transaction.commit();
            } else {
                transaction.abort()
            }
        } catch (e) {
            transaction.abort();
        }
        return node;
    }


    async function editNodeProperty(id: string, properties: any): Promise<GraphNode> {
        return await changeNode(id, node => {
            node.properties = properties
            return "commit";
        })
    }

    async function editNodeType(id: string, type: string): Promise<GraphNode> {
        return await changeNode(id, node => {
            if (node.type === type) {
                return "abort";
            }
            node.type = type;
            return "commit";
        })
    }

    async function newEmptyNode(): Promise<GraphNode> {
        let id = window.crypto.randomUUID();
        while (await graph.getNode(id) != null) {
            // generate node id until not find
            id = window.crypto.randomUUID();
        }
        const [transaction, store] = writeStore("node", db)
        const node: GraphNode = {
            id,
            type: "New",
            properties: {}
        }
        await asPromise(store.add(node));
        transaction.commit();
        return node;
    }

    return {
        editNodeProperty,
        editNodeType,
        newEmptyNode,

        async removeNode(id: string): Promise<void> {
            const [transaction, store] = writeStore("node", db)
            await asPromise(store.delete(id));
            transaction.commit();
        },

        async copyNode(id: string): Promise<GraphNode> {
            const oldNode = await graph.getNode(id);
            const newNode = await newEmptyNode();
            await editNodeType(newNode.id, oldNode.type);
            await editNodeProperty(newNode.id, oldNode.properties);
            return await graph.getNode(newNode.id);
        },
    }
}

function createGraphMeta(graph: Graph): GraphMeta {
    return {
        async getNodeMeta(type: string): Promise<GraphNodeMeta> {
            const typeNodes = await graph.searchNodes({
                type: "and",
                searchers: [
                    typeSearcher("NodeType"),
                    {
                        type: "eq",
                        jsonPath: "$.name",
                        value: type
                    }
                ]
            });
            let meta: GraphNodeMeta = {name: type}
            if (typeNodes.length != 1) {
                console.log("Multiple node with type", typeNodes, type)
                throw Error("Multiple nodes")
            } else if (typeNodes.length == 1) {
                meta = typeNodes[0].properties
            }
            return meta
        },

        async getNodeTypes(): Promise<string[]> {
            const nodes = await graph.searchNodes(typeSearcher("NodeType"));
            const types = new Set<string>();
            nodes.forEach(node => {
                types.add(node.properties["name"]);
            });
            return Array.from(types).sort();
        },
    }
}


function createLocalJson(db: IDBDatabase): LocalJson {
    async function cleanUp() {
        for (const table of ["node", "relationship"] as ("node" | "relationship")[]) {
            const [transaction, store] = writeStore(table, db);
            (await asPromise(store.getAllKeys())).forEach(key => {
                store.delete(key)
            })
            transaction.commit();
        }
    }

    return {
        async exportAll() {
            const nodes = await asPromise(readStore("node", db).getAll());
            const relationships = await asPromise(readStore("relationship", db).getAll());
            return {
                node: nodes,
                relationship: relationships,
            }
        },

        async importAll(data) {
            await cleanUp();
            for (const table of ["node", "relationship"] as ("node" | "relationship")[]) {
                const [transaction, store] = writeStore(table, db)
                data[table].forEach((n: any) => {
                    store.put(n);
                });
                transaction.commit();
            }
        },
    }
}


function readStore(store: "node" | "relationship", db: IDBDatabase) {
    return db.transaction(store, "readonly").objectStore(store);
}

function writeStore(store: "node" | "relationship", db: IDBDatabase): [IDBTransaction, IDBObjectStore] {
    const transaction = db.transaction(store, "readwrite");
    const objectStore = transaction.objectStore(store)
    return [transaction, objectStore]
}

function asPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        request.onsuccess = _ => resolve(request.result)
        request.onerror = _ => reject(request.error)
    })
}
