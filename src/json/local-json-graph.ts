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

    private read(store: "node" | "relationship") {
        return this.db.transaction(store, "readonly").objectStore(store);
    }

    private write(store: "node" | "relationship"): [IDBTransaction, IDBObjectStore] {
        const transaction = this.db.transaction(store, "readwrite");
        const objectStore = transaction.objectStore(store)
        return [transaction, objectStore]
    }

    async getValue(store: "node" | "relationship", id: string): Promise<any | null> {
        const objectStore = this.read(store);
        let key = await asPromise(objectStore.getKey(id));
        if (key === undefined) {
            return null
        }
        return await asPromise(objectStore.get(id))
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
        const nodes = await asPromise(this.read("node").getAll());
        return {value: nodes.filter(it => checkNode(it, searcher))};
    }

    async searchRelationships(searcher: RelationshipSearcher): Promise<ExtendableValue<GraphRelationship[]>> {
        const relationships = await asPromise(this.read("relationship").getAll());
        return {value: relationships.filter(it => checkRelationship(it, searcher))};
    }

    async changeNode(id: string, cdc: (node: GraphNode) => "abort" | "commit"): Promise<GraphNode> {
        const [transaction, store] = this.write("node")
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
        const [transaction, store] = this.write("node")
        const node: GraphNode = {
            id,
            labels: [],
            properties: {}
        }
        await asPromise(store.add(node));
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
        const [transaction, store] = this.write("node")
        await asPromise(store.delete(id));
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
        let properties: GraphPropertyMeta[]
        const labelNodes = (await this.searchNodes({
            type: "and",
            searchers: [
                {
                    type: "label",
                    label: "Label"
                },
                {
                    type: "eq",
                    key: "name",
                    value: {
                        value: label
                    }
                }
            ]
        })).value;
        if (labelNodes.length != 1) {
            properties = []
        } else {
            function createGraphPropertyMeta(node: GraphNode): GraphPropertyMeta {
                return {
                    key: node.properties["key"].value,
                    required: node.properties["required"]?.value == "true",
                    show: node.properties["show"]?.value,
                };
            }

            let relationships = (await this.searchRelationships({
                type: "and",
                searchers: [
                    {
                        type: "type",
                        value: "Has"
                    },
                    {
                        type: "node",
                        nodeId: labelNodes[0].id,
                        match: "start"
                    }
                ]
            })).value;

            let nodes = await Promise.all(relationships.map(r => this.getNode(r.endNodeId)))
            properties = nodes.map(n => createGraphPropertyMeta(n))
        }
        return {
            label,
            properties,
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
        const nodes = await asPromise(this.read("node").getAll());
        const relationships = await asPromise(this.read("relationship").getAll());
        return {
            node: nodes,
            relationship: relationships,
        }
    }

    async importAll(data: { node: GraphNode[], relationship: GraphRelationship[] }) {
        await this.cleanUp();
        for (const table of ["node", "relationship"] as ("node" | "relationship")[]) {
            const [transaction, store] = this.write(table)
            data[table].forEach((n: any) => {
                store.put(n);
            });
            transaction.commit();
        }
    }

    async cleanUp() {
        for (const table of ["node", "relationship"] as ("node" | "relationship")[]) {
            const [transaction, store] = this.write(table);
            (await asPromise(store.getAllKeys())).forEach(key => {
                store.delete(key)
            })
            transaction.commit();
        }
    }

}
