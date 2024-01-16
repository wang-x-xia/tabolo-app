import {MoreOutlined} from "@ant-design/icons"
import {Button, Popover, Space} from "antd"
import {JSONPath} from "jsonpath-plus"
import {useContext} from "react"
import type {GraphNode} from "tabolo-core"
import {GraphContext, GraphMetaContext} from "../data/graph"
import {useAsync, useAsyncOrDefault} from "../utils/hooks"
import {ViewHandlerContext} from "../view/view"
import {NodeCellConfig} from "./node-cell.ts"
import {PropertyValueCell} from "./PropertyValueCell"

export function NodeIdCell({data}: {
    data: string
}) {
    const graph = useContext(GraphContext)
    const nodeAsync = useAsync(async () => {
        return await graph.getNode(data)
    }, [data])

    switch (nodeAsync.status) {
        case "loading":
            return <>Loading</>;
        case "error":
            return <>Error</>;
        case "done":
            return <NodeCell data={nodeAsync.value!!}/>
    }
}

export function NodeCell({data}: {
    data: GraphNode
}) {

    const viewHandler = useContext(ViewHandlerContext)
    const graphMeta = useContext(GraphMetaContext)

    const config: NodeCellConfig = useAsyncOrDefault({type: "ShowType", provider: "default"}, async () => {
        const meta = await graphMeta.getNodeMeta(data.type)
        if (meta.showJsonPath) {
            return {
                provider: "Node Meta",
                type: "ShowJsonPath",
                jsonPath: meta.showJsonPath
            }
        } else {
            return {type: "ShowType", provider: "default"}
        }
    }, [graphMeta, data.type])

    function editNode() {
        viewHandler.updateView({
            type: "NodeEditView",
            nodeId: data.id,
        })
    }

    const showJsonPathPart = config.type === "ShowJsonPath" ?
        <ShowJsonPath data={data} jsonPath={config.jsonPath}/> : <></>

    return <Popover title={`${data.type} Properties`} content={JSON.stringify(data.properties, null, 2)}>
        <Space.Compact block>
            <Button>{`<${data.type}>`}</Button>
            {showJsonPathPart}
            <Button icon={<MoreOutlined/>} onClick={editNode}/>
        </Space.Compact>
    </Popover>
}

function ShowJsonPath({data, jsonPath}: {
    data: GraphNode,
    jsonPath: string,
}) {
    const property = JSONPath({path: jsonPath, json: data.properties, wrap: false})

    if (property === undefined) {
        return <Button>{jsonPath}</Button>
    } else {
        return <Button>
            <PropertyValueCell data={property}/>
        </Button>
    }
}