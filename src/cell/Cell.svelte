<script lang="ts">
    import type {RowHeader} from "../view/type";
    import NodeCell from "./NodeCell.svelte";
    import {isNode, isRelationship} from "neo4j-driver";
    import RelationshipCell from "./RelationshipCell.svelte";
    import PrimitiveCell from "./PrimitiveCell.svelte";

    export let header: RowHeader
    export let data: any
</script>


{#if (header.type === "auto")}
    {#if (isNode(data))}
        <NodeCell {data}/>
    {:else if (isRelationship(data))}
        <RelationshipCell {data}/>
    {:else }
        <PrimitiveCell {data}/>
    {/if}
{/if}
