import type {GraphRelationship} from "./graph";
import {type GraphId, isSameGraphId} from "./graph-id";
import {
    checkGraphResource,
    type GraphResourceCommonSearcher,
    type MatchAllSearcher,
    type MatchAnySearcher,
    type NotSearcher
} from "./searcher";

export type RelationshipSearcher =
    GraphResourceCommonSearcher |
    RelationshipNodeSearcher |
    MatchAllSearcher<RelationshipSearcher> |
    MatchAnySearcher<RelationshipSearcher> |
    NotSearcher<RelationshipSearcher>

export interface RelationshipNodeSearcher {
    type: "node",
    nodeId: GraphId,
    match: "start" | "end" | "both",
}

export function relationshipNodeSearcher(nodeId: GraphId, match: "start" | "end" | "both" = "both"): RelationshipNodeSearcher {
    return {type: "node", nodeId, match,}
}

function checkRelationshipInternal(relationship: GraphRelationship, searcher: RelationshipSearcher): boolean {
    switch (searcher.type) {
        case "node":
            switch (searcher.match) {
                case "start":
                    return isSameGraphId(relationship.startNodeId, searcher.nodeId)
                case "end":
                    return isSameGraphId(relationship.endNodeId, searcher.nodeId)
                case "both":
                    return isSameGraphId(relationship.startNodeId, searcher.nodeId) ||
                        isSameGraphId(relationship.endNodeId, searcher.nodeId)
                default: {
                    throw Error(`Invalid searcher for node ${JSON.stringify(searcher)}`)
                }
            }
        default: {
            throw Error(`Invalid searcher ${JSON.stringify(searcher)}`)
        }
    }
}

export function checkRelationship(relationship: GraphRelationship, searcher: RelationshipSearcher): boolean {
    return checkGraphResource(relationship, searcher, checkRelationshipInternal)
}
