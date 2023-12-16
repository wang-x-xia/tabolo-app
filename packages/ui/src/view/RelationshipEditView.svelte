<script lang="ts">

    import {getGraph} from "../data/graph";
    import type {RelationshipEditViewData} from "./view";
    import RelationshipEdit from "../edit/RelationshipEdit.svelte";

    let graph = getGraph()

    export let data: RelationshipEditViewData

    let relationshipAsync = graph.getRelationship(data.relationshipId)

</script>

<div class="w-full flex justify-center">
    {#await relationshipAsync}
        Loading
    {:then relationship}
        <RelationshipEdit data={relationship}></RelationshipEdit>
    {/await}
</div>