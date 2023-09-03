<script lang="ts">
    import type {RowHeader} from "../view/type";
    import NodeCell from "./NodeCell.svelte";
    import PrimitiveCell from "./PrimitiveCell.svelte";
    import {getType} from "../data/graph";
    import RelationshipCell from "./RelationshipCell.svelte";

    export let header: RowHeader
    export let data: any

    const type = getType(data)
</script>


{#if (header.type === "auto")}
    {#if (type === "node")}
        <NodeCell {data}/>
    {:else if (type === "relationship")}
        <RelationshipCell {data}/>
    {:else }
        <PrimitiveCell {data}/>
    {/if}
{/if}
