import {Dropdown} from "flowbite-react"
import {JSONPath} from "jsonpath-plus"
import type {GraphId, GraphNode} from "../../core"
import {useAsync, useAsyncOrDefault, useGraph, useGraphMeta, useViewHandler} from "../utils/hooks"
import {NodeCellConfig} from "./node-cell.ts"
import {PropertyValueCell} from "./PropertyValueCell"

export function NodeIdCell({data}: {
    data: GraphId
}) {
    const graph = useGraph()
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

    const viewHandler = useViewHandler()
    const graphMeta = useGraphMeta()

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

    async function editNode() {
        await viewHandler.updateView({
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