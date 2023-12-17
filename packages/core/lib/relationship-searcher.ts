import type {EmptySearcher, TypeSearcher} from "./searcher";
import type {GraphRelationship} from "./graph";

export type RelationshipSearcher = EmptySearcher | TypeSearcher | RelationshipNodeSearcher | MatchAllSearcher

export interface RelationshipNodeSearcher {
    type: "node",
    nodeId: string,
    match: "start" | "end" | "both",
}

export function relationshipNodeSearcher(nodeId: string, match: "start" | "end" | "both" = "both"): RelationshipNodeSearcher {
    return {type: "node", nodeId, match,}
}

export interface MatchAllSearcher {
    type: "and",
    searchers: RelationshipSearcher[],
}

export function checkRelationship(relationship: GraphRelationship, searcher: RelationshipSearcher): boolean {
    switch (searcher.type) {
        case "empty":
            return true;
        case "type":
            return relationship.type == searcher.value;
        case "node":
            switch (searcher.match) {
                case "start":
                    return relationship.startNodeId == searcher.nodeId;
                case "end":
                    return relationship.endNodeId == searcher.nodeId;
                case "both":
                    return relationship.startNodeId == searcher.nodeId || relationship.endNodeId == searcher.nodeId;
                default:
                    throw Error()
            }
        case "and":
            return searcher.searchers.every(s => checkRelationship(relationship, s))
    }
}
