import {getContext, setContext} from "svelte";
import type {Readable} from "svelte/store";
import {readable} from "svelte/store";

export function randomElementId(prefix: string | null = null): string {
    let randomId: string = crypto.randomUUID()
    if (prefix !== null) {
        randomId = prefix + "_" + randomId
    }
    return randomId
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

export function asyncReadable<T>(defaultValue: T, async: () => Promise<T>): Readable<T> {
    return readable(defaultValue, (set) => {
        async().then(set)
    })
}