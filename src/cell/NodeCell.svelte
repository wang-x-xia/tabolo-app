<script lang="ts">
    import NodeOneLabelCell from "./NodeOneLabelCell.svelte";
    import type {GraphNode} from "../data/graph.js";

    export let data: GraphNode

</script>


{#each data.labels as label}
    <NodeOneLabelCell {data} {label}></NodeOneLabelCell>
{/each}