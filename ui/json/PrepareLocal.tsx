import {Button, Modal, Textarea} from "flowbite-react";
import {Context, type PropsWithChildren, useCallback, useContext, useState} from "react"
import {
    createHttpClientGraph,
    createHttpClientGraphEdit,
    emptySearcher,
    type Graph,
    type GraphEdit,
    type GraphMeta
} from "../../core"
import {GraphContext, GraphMetaContext} from "../data/graph.ts"
import {GraphEditContext} from "../edit/graph-edit.ts"
import {useAsync} from "../utils/hooks.ts"
import {useMenuItem} from "../view/menu.tsx";
import {type BatchOperation, createGraphMetaFromGraph, createJsonKv} from "./local-json-graph.ts"

export function PrepareLocal({children, batchOpKey}: PropsWithChildren & {
    batchOpKey: Context<BatchOperation>
}) {
    if (import.meta.env.DEV) {
        const graph = createHttpClientGraph({baseUrl: `${location.origin}/dev-graph/graph`});
        const graphEdit = createHttpClientGraphEdit({baseUrl: `${location.origin}/dev-graph/graphEdit`});
        const graphMeta = createGraphMetaFromGraph(graph)
        const batchOp: BatchOperation = {
            async exportAll() {
                return {
                    node: await graph.searchNodes(emptySearcher()),
                    relationship: await graph.searchRelationships(emptySearcher()),
                }
            },

            async importAll(_) {
                console.log("No OP for import all when dev")
            },
        }

        return <SetupLocal graph={graph} graphEdit={graphEdit} graphMeta={graphMeta}>
            <batchOpKey.Provider value={batchOp}>
                {children}
            </batchOpKey.Provider>
        </SetupLocal>
    }


    const jsonKv = useAsync(() => createJsonKv("Tabolo"), [])

    switch (jsonKv.status) {
        case "loading":
            return <>Loading db</>
        case "error":
            return <>Failed to load db</>
        case "done":
            const [graph, graphEdit, graphMeta, batchOp] = jsonKv.value
            return <SetupLocal graph={graph} graphEdit={graphEdit} graphMeta={graphMeta}>
                <batchOpKey.Provider value={batchOp}>
                    {children}
                </batchOpKey.Provider>
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

export function BatchOpMenuItems({batchOpKey}: {
    batchOpKey: Context<BatchOperation>
}) {
    const [importAllModalOpen, setImportAllModalOpen] = useState(false)
    const [importAllValue, setImportAllValue] = useState("")

    const batchOp = useContext(batchOpKey)

    const exportAll = useCallback(async () => {
        const result = await batchOp.exportAll()
        const url = URL.createObjectURL(new File([JSON.stringify(result, null, 2)], "data.json", {type: "application/json"}))
        window.open(url, "_blank")
    }, [batchOp])

    const exportAllMenu = useMenuItem("Export All", <Button onClick={exportAll}>Export All</Button>)

    const importAll = useCallback(async () => {
        await batchOp.importAll(JSON.parse(importAllValue))
        setImportAllValue("")
        setImportAllModalOpen(false)
    }, [batchOp, importAllValue])

    const importAllMenu = useMenuItem("Import All", <Button onClick={() => setImportAllModalOpen(true)}>Import
        All</Button>)

    const reset = useCallback(async () => {
        await batchOp.importAll(await import("../assets/Tabolo.json"))
    }, [batchOp])

    const resetMenu = useMenuItem("Reset Graph Data", <Button onClick={reset}>Reset Local Data</Button>)

    return <>
        {exportAllMenu}
        {importAllMenu}
        {resetMenu}
        <Modal show={importAllModalOpen} onClose={() => setImportAllModalOpen(false)} size="7xl">
            <Modal.Header>Import All data</Modal.Header>
            <Modal.Body>
                <Textarea rows={20} onChange={e => setImportAllValue(e.target.value)}/>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={importAll}>Submit</Button>
            </Modal.Footer>
        </Modal>
    </>
}