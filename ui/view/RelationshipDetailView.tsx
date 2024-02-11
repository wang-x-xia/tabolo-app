import {RelationshipDetail} from "../detail/RelationshipDetail.tsx";
import {useAsync, useGraph} from "../utils/hooks";
import type {RelationshipDetailViewData} from "./view.ts";

export function RelationshipDetailView({data}: {
    data: RelationshipDetailViewData,
}) {
    const graph = useGraph()

    const relationshipAsync = useAsync(async () => {
        return await graph.getRelationship(data.relationshipId)
    }, [graph, data])


    switch (relationshipAsync.status) {
        case "loading":
            return <>Loading</>
        case "error":
            return <>Error</>
        case "done":
            return <RelationshipDetail data={relationshipAsync.value!!}/>

    }
}