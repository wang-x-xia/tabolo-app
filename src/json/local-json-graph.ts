import type {Graph, GraphMeta, GraphNode, GraphNodeLabelMeta, GraphPropertyValue, Searcher} from "../data/graph";
import type {GraphEdit} from "../edit/graph-edit";
import type {GraphPropertyEditHandler} from "../edit/property-edit";
import type {GraphNodeEditHandler} from "../edit/node-edit";
import {GraphNodeEditHandlerImpl} from "../edit/node-edit";

function asPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        request.onsuccess = _ => resolve(request.result)
        request.onerror = _ => reject(request.error)
    })
}

export async function createJsonKv(name: string) {
    let openDb = window.indexedDB.open(name);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
        openDb.onupgradeneeded = _ => {
            createNodeStore(openDb.result);
            createRelationshipStore(openDb.result);
        }
        openDb.onsuccess = _ => resolve(openDb.result)
        openDb.onerror = _ => reject(openDb.error)
    })
    return new LocalJsonGraph(db)
}

function createNodeStore(db: IDBDatabase) {
    if (!db.objectStoreNames.contains("node")) {
        db.createObjectStore("node", {keyPath: "id"})
            .createIndex("labels", "labels", {multiEntry: true, unique: false})
    }
}

function createRelationshipStore(db: IDBDatabase) {
    if (!db.objectStoreNames.contains("relationship")) {
        db.createObjectStore("relationship", {keyPath: "id"})
            .createIndex("type", "type", {unique: false})
    }
}

export class LocalJsonGraph implements Graph, GraphEdit, GraphMeta {

    private db: IDBDatabase

    constructor(db: IDBDatabase) {
        this.db = db
    }

    async getValue(store: string, id: string): Promise<any | null> {
        let transaction = this.db.transaction(store, "readonly");
        let key = await asPromise(transaction.objectStore(store).getKey(id));
        if (key === undefined) {
            return null
        }
        return await asPromise(transaction.objectStore(store).get(id))
    }

    async getNode(id: string): Promise<GraphNode | null> {
        return await this.getValue("node", id)
    }

    async getNodes(ids: string[]): Promise<Record<string, GraphNode>> {
        const result: Record<string, GraphNode> = {}
        for (const id of ids) {
            let node = await this.getNode(id);
            if (node === null) {
                result[id] = node
            }
        }
        return result
    }

    async searchNodes(searcher: Searcher): Promise<GraphNode[]> {
        switch (searcher.type) {
            case "null":
                return await asPromise(this.db.transaction("node", "readonly")
                    .objectStore("node")
                    .getAll())
        }
        return [];
    }

    async changeNode(id: string, cdc: (node: GraphNode) => "abort" | "commit"): Promise<GraphNode> {
        let transaction = this.db.transaction("node", "readwrite");
        let node = await asPromise(transaction.objectStore("node").get(id)) as GraphNode;
        try {
            if (cdc(node) == "commit") {
                await asPromise(transaction.objectStore("node").put(node))
                transaction.commit();
            } else {
                transaction.abort()
            }
        } catch (e) {
            transaction.abort();
        }
        return node;
    }

    async addLabelToNode(id: string, label: string): Promise<GraphNode> {
        return await this.changeNode(id, node => {
            if (node.labels.includes(label)) {
                return "abort";
            }
            node.labels = [label, ...node.labels];
            return "commit";
        })
    }

    async editNodeProperties(old: GraphNode, propertyHandlers: Record<string, GraphPropertyEditHandler>): Promise<GraphNode> {
        return await this.changeNode(old.id, node => {
            for (const key in propertyHandlers) {
                const value = propertyHandlers[key]
                if (!value.mutable) {
                    continue
                }
                if (value.value) {
                    node.properties[key] = {value: value.value}
                } else {
                    delete node.properties[key]
                }
            }
            return "commit";
        })
    }

    async newEmptyNode(): Promise<GraphNode> {
        let id = window.crypto.randomUUID();
        while (await this.getNode(id) != null) {
            // generate node id until not find
            id = window.crypto.randomUUID();
        }
        let transaction = this.db.transaction("node", "readwrite");
        let node: GraphNode = {
            id,
            labels: [],
            properties: {}
        }
        await asPromise(transaction.objectStore("node").add(node));
        transaction.commit();
        return node;
    }

    nodeEditHandler(node: GraphNode): GraphNodeEditHandler {
        return new GraphNodeEditHandlerImpl(node, this);
    }

    nodePropertyEditHandler(data: GraphNode, key: string, value: GraphPropertyValue | null): GraphPropertyEditHandler {
        return {
            key,
            mutable: true,
            required: false,
            value: value == null ? "" : value.value,
        }
    }

    async removeLabelFromNode(id: string, label: string): Promise<GraphNode> {
        return await this.changeNode(id, node => {
            if (!node.labels.includes(label)) {
                return "abort";
            }
            node.labels = node.labels.filter(it => it != label);
            return "commit";
        })
    }

    async removeNode(id: string): Promise<void> {
        let transaction = this.db.transaction("node", "readwrite");
        await asPromise(transaction.objectStore("node").delete(id));
        transaction.commit();
    }

    async getLabel(label: string): Promise<GraphNodeLabelMeta> {
        return {
            label,
            properties: [],
            uniqueConstraints: []
        }
    }

    async getLabels(): Promise<string[]> {
        return await asPromise(this.db.transaction("node", "readonly")
            .objectStore("node")
            .index("label")
            .getAllKeys()) as string[];
    }
}
