export type GraphId = unknown

export function isSameGraphId(left: GraphId, right: GraphId) {
    return JSON.stringify(left) === JSON.stringify(right)
}

export function displayGraphId(id: GraphId): string {
    switch (typeof id) {
        default:
            return JSON.stringify(id)
        case "string":
            return id
    }
}