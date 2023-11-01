export interface EmptySearcher {
    type: "empty",
}

export function emptySearcher(): EmptySearcher {
    return {
        type: "empty",
    }
}
