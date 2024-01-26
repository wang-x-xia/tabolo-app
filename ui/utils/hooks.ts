import {DependencyList, useEffect, useMemo, useState} from "react";

export type AsyncResult<T> = {
    status: "loading",
} | {
    status: "error",
    error: any,
} | {
    status: "done",
    value: T,
}

export function useAsync<T>(value: () => Promise<T>, dependencies: DependencyList): AsyncResult<T> {
    const [result, setResult] =
        useState<AsyncResult<T>>({status: "loading"})

    useEffect(() => {
        value().then(v => setResult({status: "done", value: v}))
            .catch(e => setResult({status: "error", error: e}))
    }, dependencies)

    return result
}

export function useAsyncOrDefault<T>(defaultValue: T, value: () => Promise<T>, dependencies: DependencyList): T {
    const asyncResult = useAsync(value, dependencies)
    return useMemo(() => {
        switch (asyncResult.status) {
            case "loading":
            case "error":
                return defaultValue
            case "done":
                return asyncResult.value
        }
    }, [asyncResult]);
}