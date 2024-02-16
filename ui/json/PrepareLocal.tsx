import {type PropsWithChildren} from "react"
import {createHttpClient, createMemoryGraph, type Graph, type GraphEdit, type GraphMeta} from "../../core"
import {createTypeDispatcher} from "../../core/impl/type-dispatcher.ts";
import {GraphContext, GraphEditContext, GraphMetaContext, useAsync} from "../utils/hooks";
import {createLocalStorageHandler} from "../utils/local-storage.ts";

export function PrepareLocal({children}: PropsWithChildren) {
    const suiteAsync = useAsync(async () => {
        const remote = createHttpClient({baseUrl: `${location.origin}/dev-graph`})
        const nodeTypes: Record<string, string> = {}
        for (const t of await remote.meta.getNodeTypes()) {
            nodeTypes[t] = "Remote"
        }
        nodeTypes["View"] = "Local"
        const relationshipTypes: Record<string, string> = {}
        for (const t of await remote.meta.getRelationshipTypes()) {
            relationshipTypes[t] = "Remote"
        }
        return createTypeDispatcher({
            suites: {
                "Local": createMemoryGraph({handler: createLocalStorageHandler()}),
                "Remote": remote,
            },
            nodeTypes,
            relationshipTypes,
        })
    }, [])

    switch (suiteAsync.status) {
        case "loading":
            return <> Error</>
        case "error":
            return <> Error</>
        case "done":
            const {graph, edit, meta} = suiteAsync.value
            return <SetupLocal graph={graph} graphEdit={edit} graphMeta={meta}>
                {children}
            </SetupLocal>
    }
}

export function SetupLocal({graph, graphEdit, graphMeta, children}: PropsWithChildren<{
    graph: Graph,
    graphEdit: GraphEdit,
    graphMeta: GraphMeta,
}>) {
    return <>
        <GraphContext.Provider value={graph}>
            <GraphEditContext.Provider value={graphEdit}>
                <GraphMetaContext.Provider value={graphMeta}>
                    {children}
                </GraphMetaContext.Provider>
            </GraphEditContext.Provider>
        </GraphContext.Provider>
    </>
}
