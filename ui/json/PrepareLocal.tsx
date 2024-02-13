import {Button, Modal, Textarea} from "flowbite-react";
import {Context, type PropsWithChildren, useCallback, useContext, useMemo, useState} from "react"
import {
    createDefaultMemoryHandler,
    createHttpClient,
    createMemoryGraph,
    emptySearcher,
    type Graph,
    type GraphEdit,
    type GraphMeta,
    type GraphSuite
} from "../../core"
import {GraphContext, GraphEditContext, GraphMetaContext} from "../utils/hooks";
import {useMenuItem} from "../view/menu.tsx";
import {type BatchOperation} from "./local-json-graph.ts"

export function PrepareLocal({children, batchOpKey}: PropsWithChildren & {
    batchOpKey: Context<BatchOperation>
}) {
    let suite: GraphSuite
    if (import.meta.env.DEV) {
        suite = createHttpClient({baseUrl: `${location.origin}/dev-graph`})
    } else {
        suite = useMemo(() => createMemoryGraph({handler: createDefaultMemoryHandler()}), [])
    }

    const batchOp: BatchOperation = {
        async exportAll() {
            return {
                node: await suite.graph.searchNodes(emptySearcher()),
                relationship: await suite.graph.searchRelationships(emptySearcher()),
            }
        },

        async importAll(_) {
            // TODO
            alert("Not support yet!")
        },
    }

    return <SetupLocal graph={suite.graph} graphEdit={suite.edit} graphMeta={suite.meta}>
        <batchOpKey.Provider value={batchOp}>
            {children}
        </batchOpKey.Provider>
    </SetupLocal>
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