import type {Graph, GraphNode, Searcher} from "../data/graph";

function asPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        request.onsuccess = _ => resolve(request.result)
        request.onerror = _ => reject(request.error)
    })
}


async function createJsonKv(name: string) {
    const db = await asPromise(window.indexedDB.open(name))
    createNodeStore(db)
    createRelationshipStore(db)
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

class LocalJsonGraph implements Graph {

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
}
