import {Dropdown} from "flowbite-react"
import {JSONPath} from "jsonpath-plus"
import {useContext} from "react"
import type {GraphNode} from "../../core"
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

    return <div className="flex flex-col items-center
        rounded-lg border border-gray-200 bg-white shadow-md
        dark:border-gray-700 dark:bg-gray-800
        w-fit max-w-64 p-2 gap-1">
        <div className="self-end">
            <Dropdown inline label="">
                <Dropdown.Item>
                    <a onClick={editNode}>Edit</a>
                </Dropdown.Item>
            </Dropdown>
        </div>
        <h5 className="font-bold text-xs">{`<${data.type}>`}</h5>
        {showJsonPathPart}
    </div>
}

function ShowJsonPath({data, jsonPath}: {
    data: GraphNode,
    jsonPath: string,
}) {
    const property = JSONPath({path: jsonPath, json: data.properties, wrap: false})

    if (property === undefined) {
        return <p>{jsonPath}</p>
    } else {
        return <p>
            <PropertyValueCell data={property}/>
        </p>
    }
}