export function randomString(prefix = "") {
    return `${prefix} ${new Date().toISOString()}`
}

export function debugRandomString(prefix = "") {
    if (import.meta.env.DEV) {
        return randomString(prefix)
    } else {
        return ""
    }
}