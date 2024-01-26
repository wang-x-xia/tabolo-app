import {useContext} from "react";
import {GraphContext} from "../data/graph.ts";
import {NodeEdit} from "../edit/NodeEdit.tsx";
import {useAsync} from "../utils/hooks.ts";
import type {NodeEditViewData} from "./view.ts";

export function NodeEditView({data}: {
    data: NodeEditViewData
}) {
    const graph = useContext(GraphContext)
    const nodeAsync = useAsync(async () => {
        return graph.getNode(data.nodeId)
    }, [graph, data])

    switch (nodeAsync.status) {
        case "loading":
            return <>Loading</>
        case "error":
            return <>Error</>
        case "done":
            return <NodeEdit data={nodeAsync.value!!}/>

    }
}