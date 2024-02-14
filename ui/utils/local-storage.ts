import type {GraphNode, GraphRelationship, MemoryHandler} from "../../core";


export function createLocalStorageHandler(): MemoryHandler {
    return {
        nodes(): Record<string, GraphNode> {
            return JSON.parse(localStorage.getItem("node") || "{}")
        },
        relationships(): Record<string, GraphRelationship> {
            return JSON.parse(localStorage.getItem("relationship") || "{}")
        },
        saveNodes(nodes: Record<string, GraphNode>): void {
            localStorage.setItem("node", JSON.stringify(nodes))
        },
        saveRelationships(relationships: Record<string, GraphRelationship>): void {
            localStorage.setItem("relationship", JSON.stringify(relationships))
        }
    }
}