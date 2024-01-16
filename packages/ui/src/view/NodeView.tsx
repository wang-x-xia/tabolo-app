import {Button, Table, TableProps} from "antd"
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
            queryData("NotUpdateView")
        }
    }, [data])

    const [nodes, setNodes] = useState<GraphNode[]>()

    const queryData = useCallback(async function (updateView: "UpdateView" | "NotUpdateView" = "UpdateView") {
        if (updateView === "UpdateView") {
            await viewHandler.updateView({
                type: "NodeView",
                searcher: localSearcher!!
            })
        }
        setNodes(await graph.searchNodes(localSearcher!!))
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
        <Button type="primary" onClick={() => queryData()}>Refresh</Button>
        <Button type="primary" onClick={addNode}>Add New Node</Button>
        <NodeSearch data={localSearcher} onChange={setLocalSearcher}/>
        <Table columns={columns} dataSource={nodes} rowKey="id"/>
    </>
}