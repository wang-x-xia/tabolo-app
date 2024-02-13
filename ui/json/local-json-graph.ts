import {type GraphNode, type GraphRelationship} from "../../core";

export interface BatchOperation {
    exportAll(): Promise<{ node: GraphNode[], relationship: GraphRelationship[] }>

    importAll(data: { node: GraphNode[], relationship: GraphRelationship[] }): Promise<void>
}
