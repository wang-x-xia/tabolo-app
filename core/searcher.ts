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
