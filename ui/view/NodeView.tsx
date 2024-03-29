import {Button, Table} from "flowbite-react";
import {useCallback, useEffect, useState} from "react"
import {alwaysTrueSearcher, GraphNode, NodeSearcher} from "../../core"
import {NodeCell} from "../cell/NodeCell.tsx";
import {NodeSearch} from "../search/NodeSearch.tsx";
import {TABLE_THEME} from "../utils/flowbite.ts";
import {useGraph, useGraphEdit, useViewHandler} from "../utils/hooks";
import {useMenuItem} from "./menu.tsx";
import type {PropertyViewData} from "./property.ts";
import {CreatePropertyPopupButton, PropertyView} from "./PropertyView.tsx";
import {NodeViewData} from "./view"

export function NodeView({data}: {
    data: NodeViewData | undefined
}) {
    const graph = useGraph()
    const graphEdit = useGraphEdit()
    const viewHandler = useViewHandler()

    const [columns, setColumns] = useState<PropertyViewData[]>([])
    useEffect(() => {
        if (data !== undefined && data.columns !== undefined) {
            setColumns(data.columns)
        }
    }, [data])

    const [localSearcher, setLocalSearcher] =
        useState<NodeSearcher>(data ? data.searcher : alwaysTrueSearcher())
    useEffect(() => {
        if (data !== undefined) {
            setLocalSearcher(data.searcher)
            queryData(data.searcher)
        }
    }, [data])

    const [nodes, setNodes] = useState<GraphNode[]>()

    const queryData = useCallback(async function (searcher = localSearcher) {
        setNodes(await graph.searchNodes(searcher))
    }, [localSearcher])

    const refreshMenu = useMenuItem("Refresh", <Button onClick={() => queryData()}>Refresh</Button>);

    async function addNode() {
        const node = await graphEdit.createNode({type: "New", properties: {}});
        await viewHandler.updateView({
            type: "NodeDetailView",
            nodeId: node.id,
        })
    }

    const addNodeMenu = useMenuItem("Add New Node", <Button onClick={addNode}>Add New Node</Button>);

    function addColumn(column: PropertyViewData) {
        setColumns([...columns, column])
    }

    const addColumnMenu = useMenuItem("Add New Column",
        <CreatePropertyPopupButton name="Add New Column" onCreate={addColumn}/>);
    if (nodes === undefined) {
        return <>Loading</>
    }

    return <>
        {refreshMenu}
        {addNodeMenu}
        {addColumnMenu}
        <NodeSearch data={localSearcher} onChange={setLocalSearcher}/>
        <Table theme={TABLE_THEME}>
            <Table.Head>
                <Table.HeadCell>
                    Node
                </Table.HeadCell>
                {columns.map(it => <Table.HeadCell>
                    {it.name}
                </Table.HeadCell>)}
            </Table.Head>
            <Table.Body>
                {nodes.map(node => <Table.Row key={JSON.stringify(node.id)}>
                    <Table.Cell>
                        <NodeCell data={node}/>
                    </Table.Cell>
                    {columns.map(it => <Table.Cell>
                        <PropertyView data={node.properties} config={it}/>
                    </Table.Cell>)}
                </Table.Row>)}
            </Table.Body>
        </Table>
    </>
}