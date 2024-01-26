import {useContext} from "react";
import {GraphContext} from "../data/graph.ts";
import {RelationshipEdit} from "../edit/RelationshipEdit.tsx";
import {useAsync} from "../utils/hooks.ts";
import type {RelationshipEditViewData} from "./view.ts";

export function RelationshipEditView({data}: {
    data: RelationshipEditViewData,
}) {
    const graph = useContext(GraphContext)

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