import type {GraphRelationship} from "./graph";
import {type GraphId, isSameGraphId} from "./graph-id";
import type {EmptySearcher, MatchAllSearcher, TypeSearcher} from "./searcher";

export type RelationshipSearcher =
    EmptySearcher
    | TypeSearcher
    | RelationshipNodeSearcher
    | MatchAllSearcher<RelationshipSearcher>

export interface RelationshipNodeSearcher {
    type: "node",
    nodeId: GraphId,
    match: "start" | "end" | "both",
}

export function relationshipNodeSearcher(nodeId: GraphId, match: "start" | "end" | "both" = "both"): RelationshipNodeSearcher {
    return {type: "node", nodeId, match,}
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
                    return isSameGraphId(relationship.startNodeId, searcher.nodeId)
                case "end":
                    return isSameGraphId(relationship.endNodeId, searcher.nodeId)
                case "both":
                    return isSameGraphId(relationship.startNodeId, searcher.nodeId) || isSameGraphId(relationship.endNodeId, searcher.nodeId)
                default:
                    throw Error()
            }
        case "and":
            return searcher.searchers.every(s => checkRelationship(relationship, s))
    }
}
