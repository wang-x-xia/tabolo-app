import {getContext, setContext} from "svelte";

export function randomElementId() {
    return crypto.randomUUID()
}

export function idSelector(id: string) {
    return `#${id}`
}

export function defineInContext<T>(key: string): [() => T, (value: T) => void] {
    function get() {
        return getContext<T>(key)
    }

    function set(value: T) {
        return setContext(key, value)
    }

    return [get, set]
}