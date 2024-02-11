import {createContext, DependencyList, useContext, useEffect, useMemo, useState} from "react";
import type {Graph, GraphEdit, GraphMeta} from "../../core";
import {type ViewHandler} from "../view/view";

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

export const GraphContext = createContext<Graph>(null as any)

export function useGraph(): Graph {
    return useContext(GraphContext)
}

export const GraphEditContext = createContext<GraphEdit>(null as any)

export function useGraphEdit(): GraphEdit {
    return useContext(GraphEditContext)
}

export const GraphMetaContext = createContext<GraphMeta>(null as any)

export function useGraphMeta(): GraphMeta {
    return useContext(GraphMetaContext)
}

export const ViewHandlerContext = createContext<ViewHandler>(null as any)

export function useViewHandler(): ViewHandler {
    return useContext(ViewHandlerContext)
}