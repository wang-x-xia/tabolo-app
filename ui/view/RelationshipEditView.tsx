import {RelationshipEdit} from "../edit/RelationshipEdit.tsx";
import {useAsync, useGraph} from "../utils/hooks";
import type {RelationshipEditViewData} from "./view.ts";

export function RelationshipEditView({data}: {
    data: RelationshipEditViewData,
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
            return <RelationshipEdit data={relationshipAsync.value!!}/>

    }
}