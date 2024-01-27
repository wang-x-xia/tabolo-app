import {PlusOutlined} from '@ant-design/icons'
import {FloatButton, Input, Modal} from 'antd'
import {type PropsWithChildren, useCallback, useState} from "react"
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
import {createGraphMetaFromGraph, createJsonKv, type LocalJson} from "./local-json-graph.ts"

export function PrepareLocal({children}: PropsWithChildren) {
    if (import.meta.env.DEV) {
        const graph = createHttpClientGraph({baseUrl: `${location.origin}/dev-graph/graph`});
        const graphEdit = createHttpClientGraphEdit({baseUrl: `${location.origin}/dev-graph/graphEdit`});
        const graphMeta = createGraphMetaFromGraph(graph)
        const localJson: LocalJson = {
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

        return <SetupLocal graph={graph} graphEdit={graphEdit} graphMeta={graphMeta} localJson={localJson}>
            {children}
        </SetupLocal>
    }


    const jsonKv = useAsync(() => createJsonKv("Tabolo"), [])

    switch (jsonKv.status) {
        case "loading":
            return <>Loading db</>
        case "error":
            return <>Failed to load db</>
        case "done":
            const [graph, graphEdit, graphMeta, localJson] = jsonKv.value
            return <SetupLocal graph={graph} graphEdit={graphEdit} graphMeta={graphMeta} localJson={localJson}>
                {children}
            </SetupLocal>
    }
}

export function SetupLocal({graph, graphEdit, graphMeta, localJson, children}: PropsWithChildren<{
    graph: Graph,
    graphEdit: GraphEdit,
    graphMeta: GraphMeta,
    localJson: LocalJson,
}>) {
    const [importAllModal, setImportAllModal] = useState(false)
    const [importAllValue, setImportAllValue] = useState("")

    const exportAll = useCallback(async () => {
        const result = await localJson.exportAll()
        const url = URL.createObjectURL(new File([JSON.stringify(result, null, 2)], "data.json", {type: "application/json"}))
        window.open(url, "_blank")
    }, [localJson])

    const importAll = useCallback(async () => {
        await localJson.importAll(JSON.parse(importAllValue))
        setImportAllValue("")
        setImportAllModal(false)
    }, [localJson, importAllValue])

    const reset = useCallback(async () => {
        await localJson.importAll(await import("../assets/Tabolo.json"))
    }, [localJson])

    return <>
        <GraphContext.Provider value={graph}>
            <GraphEditContext.Provider value={graphEdit}>
                <GraphMetaContext.Provider value={graphMeta}>
                    {children}
                </GraphMetaContext.Provider>
            </GraphEditContext.Provider>
        </GraphContext.Provider>
        <FloatButton.Group trigger="click" type="primary" style={{right: 24}} icon={<PlusOutlined/>}>
            <FloatButton description="ExportAll" onClick={exportAll}/>
            <FloatButton description="ImportAll" onClick={() => setImportAllModal(true)}/>
            <FloatButton description="ResetData" onClick={reset}/>
        </FloatButton.Group>
        <Modal title="Import All data" open={importAllModal}
               onOk={importAll}
               onCancel={() => setImportAllModal(false)}>
            <Input.TextArea rows={20} onChange={e => setImportAllValue(e.target.value)}/>
        </Modal>
    </>
}