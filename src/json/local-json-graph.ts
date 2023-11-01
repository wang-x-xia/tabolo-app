import type {
    Graph,
    GraphMeta,
    GraphNode,
    GraphNodeLabelMeta,
    GraphPropertyMeta,
    GraphPropertyValue,
    GraphRelationship
} from "../data/graph";
import type {GraphEdit} from "../edit/graph-edit";
import type {ExtendableValue} from "../data/base";
import type {NodeSearcher} from "../data/node-searcher";
import {checkNode} from "../data/node-searcher";
import {emptySearcher} from "../data/searcher";
import type {RelationshipSearcher} from "../data/relationship-searcher";
import {checkRelationship} from "../data/relationship-searcher";

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

    async getNodes(ids: string[]): Promise<ExtendableValue<Record<string, GraphNode>>> {
        const value: Record<string, GraphNode> = {}
        for (const id of ids) {
            let node = await this.getNode(id);
            if (node === null) {
                value[id] = node
            }
        }
        return {value}
    }

    async searchNodes(searcher: NodeSearcher): Promise<ExtendableValue<GraphNode[]>> {
        const nodes = await asPromise(this.db.transaction("node", "readonly")
            .objectStore("node")
            .getAll());
        return {value: nodes.filter(it => checkNode(it, searcher))};
    }

    async searchRelationships(searcher: RelationshipSearcher): Promise<ExtendableValue<GraphRelationship[]>> {
        const relationships = await asPromise(this.db.transaction("relationship", "readonly")
            .objectStore("relationship")
            .getAll());
        return {value: relationships.filter(it => checkRelationship(it, searcher))};
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
        const nodes = (await this.searchNodes({
            type: "and",
            searchers: [
                {
                    type: "label",
                    label: "NodeProperty"
                },
                {
                    type: "eq",
                    key: "label",
                    value: {
                        value: label
                    }
                }
            ]
        })).value;
        return {
            label,
            properties: nodes.map(it => this.createGraphPropertyMeta(it)),
        }
    }

    async getLabels(): Promise<string[]> {
        const nodes = await this.searchNodes(emptySearcher());
        const labels = new Set<string>();
        nodes.value.forEach(node => {
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

    private createGraphPropertyMeta(node: GraphNode): GraphPropertyMeta {
        return {
            key: node.properties["key"].value,
            required: node.properties["required"]?.value == "true",
            show: node.properties["show"]?.value,
        };
    }
}
