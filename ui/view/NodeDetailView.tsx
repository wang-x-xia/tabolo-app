import {NodeDetail} from "../detail/NodeDetail.tsx";
import {useAsync, useGraph} from "../utils/hooks";
import type {NodeDetailViewData} from "./view.ts";

export function NodeDetailView({data}: {
    data: NodeDetailViewData
}) {
    const graph = useGraph()
    const nodeAsync = useAsync(async () => {
        return graph.getNode(data.nodeId)
    }, [graph, data])

    switch (nodeAsync.status) {
        case "loading":
            return <>Loading</>
        case "error":
            return <>Error</>
        case "done":
            return <NodeDetail data={nodeAsync.value!!}/>

    }
}