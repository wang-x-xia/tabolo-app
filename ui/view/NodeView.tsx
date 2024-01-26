import {Table, TableProps} from "antd"
import {Button} from "flowbite-react";
import {useCallback, useContext, useEffect, useMemo, useState} from "react"
import {emptySearcher, GraphNode, NodeSearcher} from "../../core"
import {NodeCell} from "../cell/NodeCell.tsx";
import {GraphContext} from "../data/graph"
import {GraphEditContext} from "../edit/graph-edit";
import {NodeSearch} from "../search/NodeSearch.tsx";
import {useMenuItem} from "./menu.tsx";
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

    const refreshMenu = useMenuItem("Refresh", <Button onClick={() => queryData()}>Refresh</Button>);

    async function addNode() {
        const node = await graphEdit.newEmptyNode();
        await viewHandler.updateView({
            type: "NodeEditView",
            nodeId: node.id,
        })
    }

    const addNodeMenu = useMenuItem("Add New Node", <Button onClick={addNode}>Add New Node</Button>);

    if (nodes === undefined) {
        return <>Loading</>
    }

    return <>
        {refreshMenu}
        {addNodeMenu}
        <NodeSearch data={localSearcher} onChange={setLocalSearcher}/>
        <Table columns={columns} dataSource={nodes} rowKey="id"/>
    </>
}