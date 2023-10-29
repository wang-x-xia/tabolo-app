import type {
    Graph,
    GraphMeta,
    GraphNode,
    GraphNodeLabelMeta,
    GraphPropertyMeta,
    GraphPropertyValue,
    NodeSearcher
} from "../data/graph";
import type {GraphEdit} from "../edit/graph-edit";
import type {GraphPropertyEditHandler} from "../edit/property-edit";
import {GraphPropertyEditHandlerImpl} from "../edit/property-edit";
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

    async searchNodes(searcher: NodeSearcher): Promise<GraphNode[]> {
        const nodes = await asPromise(this.db.transaction("node", "readonly")
            .objectStore("node")
            .getAll());
        return nodes.filter(it => this.checkNode(it, searcher));
    }

    private checkNode(node: GraphNode, searcher: NodeSearcher) {
        switch (searcher.type) {
            case "label":
                return node.labels.includes(searcher.value.label);
            case "eq":
                const key = searcher.value.key
                return key in node.properties && node.properties[key].value == searcher.value.value.value
            case "and":
                return searcher.value.searchers.every(s => this.checkNode(node, s))
            case "null":
                return true;
        }
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

    async editNodeProperty(id: string, key: string, value: GraphPropertyValue): Promise<GraphNode> {
        return await this.changeNode(id, node => {
            node.properties[key] = {value: value.value}
            return "commit";
        })
    }

    async removeNodeProperty(id: string, key: string): Promise<GraphNode> {
        return await this.changeNode(id, node => {
            delete node.properties[key]
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
        return new GraphPropertyEditHandlerImpl(data, key, value, true, true, this);
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

    async copyNode(id: string): Promise<GraphNode> {
        const oldNode = await this.getNode(id);
        const newNode = await this.newEmptyNode();
        oldNode.labels.forEach(l => this.addLabelToNode(newNode.id, l));
        Object.entries(oldNode.properties).forEach(([key, value]) => {
            this.editNodeProperty(newNode.id, key, value);
        });
        return await this.getNode(newNode.id);
    }

    async getLabel(label: string): Promise<GraphNodeLabelMeta> {
        const nodes = await this.searchNodes({
            type: "and",
            value: {
                searchers: [
                    {
                        type: "label",
                        value: {
                            label: "NodeProperty"
                        }
                    },
                    {
                        type: "eq",
                        value: {
                            key: "label",
                            value: {
                                value: label
                            },
                        }
                    }
                ]
            }
        });
        return {
            label,
            properties: nodes.map(it => this.createGraphPropertyMeta(it)),
        }
    }

    private createGraphPropertyMeta(node: GraphNode): GraphPropertyMeta {
        return {
            key: node.properties["key"].value,
            required: node.properties["required"]?.value == "true",
            show: node.properties["show"]?.value,
        };
    }

    async getLabels(): Promise<string[]> {
        const nodes = await this.searchNodes({type: "null", value: {}});
        const labels = new Set<string>();
        nodes.forEach(node => {
            node.labels.forEach(l => labels.add(l));
        });
        return Array.from(labels).sort();
    }

    async exportAll() {
        const nodes = await asPromise(this.db.transaction("node", "readonly").objectStore("node")
            .getAll())
        return {
            node: nodes
        }
    }

    async importAll(data: { node: GraphNode[] }) {
        await this.cleanUp();
        const tx = this.db.transaction("node", "readwrite")
        const store = tx.objectStore("node");
        data.node.forEach(n => {
            store.put(n);
        });
        tx.commit();
    }

    async cleanUp() {
        const tx = this.db.transaction("node", "readwrite")
        const store = tx.objectStore("node");
        (await asPromise(store.getAllKeys())).forEach(key => {
            store.delete(key)
        })
        tx.commit();
    }
}
