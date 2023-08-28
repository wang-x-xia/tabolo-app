export function randomElementId() {
    return crypto.randomUUID()
}

export function idSelector(id: string) {
    return `#${id}`
}