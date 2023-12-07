<script lang="ts">
    import NodeCell from "./NodeCell.svelte";
    import RelationshipCell from "./RelationshipCell.svelte";
    import type {GraphValue} from "../data/graph";

    export let data: GraphValue
</script>

{#if (data.type === "node")}
    <NodeCell data={data.value}/>
{:else if (data.type === "relationship")}
    <RelationshipCell data={data.value}/>
{/if}
