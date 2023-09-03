<script lang="ts">
    import type {RowHeader} from "../view/type";
    import NodeCell from "./NodeCell.svelte";
    import PrimitiveCell from "./PrimitiveCell.svelte";
    import {getGraph} from "../data/graph";
    import RelationshipCell from "./RelationshipCell.svelte";

    export let header: RowHeader
    export let data: any

    let graph = getGraph()
</script>


{#if (header.type === "auto")}
    {#if (graph.isNode(data))}
        <NodeCell {data}/>
    {:else if (graph.isRelationship(data))}
        <RelationshipCell {data}/>
    {:else }
        <PrimitiveCell {data}/>
    {/if}
{/if}
