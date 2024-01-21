import {Table, TableProps} from "antd"
import {Button} from "flowbite-react";
import {useCallback, useContext, useEffect, useMemo, useState} from "react"
import {emptySearcher, GraphNode, NodeSearcher} from "tabolo-core"
import {NodeCell} from "../cell/NodeCell.tsx";
import {GraphContext} from "../data/graph"
import {GraphEditContext} from "../edit/graph-edit";
import {NodeSearch} from "../search/NodeSearch.tsx";
import {NodeViewData, ViewHandlerContext} from "./view"

export function NodeView({data}: {
    data: NodeViewData | undefined
}) {
    const graph = useContext(GraphContext)
    const graphEdit = useContext(GraphEditContext)
    const viewHandler = useContext(ViewHandlerContext)

    const columns: TableProps<GraphNode>['columns'] = useMemo(() => {
        return [{
            title: "Node",
            key: "node",
            render: (_, node) => <NodeCell data={node}/>,
        }]
    }, [])

    const [localSearcher, setLocalSearcher] =
        useState<NodeSearcher>(emptySearcher)
    useEffect(() => {
        if (data !== undefined) {
            setLocalSearcher(data.searcher)
            queryData("NotUpdateView", data.searcher)
        }
    }, [data])

    const [nodes, setNodes] = useState<GraphNode[]>()

    const queryData = useCallback(async function (
        updateView: "UpdateView" | "NotUpdateView" = "UpdateView",
        searcher = localSearcher) {
        if (updateView === "UpdateView") {
            await viewHandler.updateView({
                type: "NodeView",
                searcher: searcher
            })
        }
        setNodes(await graph.searchNodes(searcher))
    }, [localSearcher])


    async function addNode() {
        const node = await graphEdit.newEmptyNode();
        await viewHandler.updateView({
            type: "NodeEditView",
            nodeId: node.id,
        })
    }

    if (nodes === undefined) {
        return <>Loading</>
    }

    return <>
        <Button onClick={() => queryData()}>Refresh</Button>
        <Button onClick={addNode}>Add New Node</Button>
        <NodeSearch data={localSearcher} onChange={setLocalSearcher}/>
        <Table columns={columns} dataSource={nodes} rowKey="id"/>
    </>
}