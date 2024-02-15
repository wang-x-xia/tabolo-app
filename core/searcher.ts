import {JSONPath} from "jsonpath-plus";
import type {GraphResource} from "./graph.ts";

export interface EmptySearcher {
    type: "empty",
}

export function emptySearcher(): EmptySearcher {
    return {
        type: "empty",
    }
}


export interface TypeSearcher {
    type: "type",
    value: string,
}

export function typeSearcher(type: string): TypeSearcher {
    return {
        type: "type",
        value: type,
    }
}

export interface PropertySearcher {
    type: "eq",
    jsonPath: string,
    value: any,
}

export function propertySearcher(jsonPath: string, value: any): PropertySearcher {
    return {
        type: "eq",
        jsonPath,
        value,
    }
}

export type GraphResourceCommonSearcher = EmptySearcher | TypeSearcher | PropertySearcher

export interface MatchAllSearcher<T> {
    type: "and",
    searchers: T[],
}


export function matchAllSearcher<T>(searchers: T[]): MatchAllSearcher<T> {
    return {
        type: "and",
        searchers: searchers,
    }
}

export interface MatchAnySearcher<T> {
    type: "or",
    searchers: T[],
}


export function matchAnySearcher<T>(searchers: T[]): MatchAnySearcher<T> {
    return {
        type: "or",
        searchers: searchers,
    }
}

export interface NotSearcher<T> {
    type: "not",
    searcher: T,
}


export function notSearcher<T>(searcher: T): NotSearcher<T> {
    return {
        type: "not",
        searcher: searcher,
    }
}

export type GraphResourceLogicSearcher<T> = MatchAllSearcher<T> | MatchAnySearcher<T> | NotSearcher<T>

/*
 * The type of S is hard to define. Use a general definition
 */
export function checkGraphResource<R extends GraphResource, S extends { "type": string }>(
    resource: R, searcher: S,
    customChecker: (resource: R, searcher: S) => boolean,
): boolean {
    const internal = searcher as GraphResourceCommonSearcher | GraphResourceLogicSearcher<S>
    switch (internal.type) {
        case "type":
            return resource.type === internal.value;
        case "eq":
            const path = internal.jsonPath
            const value = JSON.stringify(JSONPath({
                path,
                json: resource.properties,
                wrap: false
            }))
            return value === JSON.stringify(internal.value)
        case "and":
            return internal.searchers.every(s => checkGraphResource(resource, s, customChecker))
        case "empty":
            return true;
        case "not":
            return !checkGraphResource(resource, internal.searcher, customChecker)
        case "or":
            return internal.searchers.some(s => checkGraphResource(resource, s, customChecker))
        default:
            return customChecker(resource, internal)
    }

}