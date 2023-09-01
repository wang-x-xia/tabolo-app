<script lang="ts">
    import {Node} from "neo4j-driver";
    import NodeOneLabelCell from "./NodeOneLabelCell.svelte";

    export let data: Node

</script>


{#each data.labels as label}
    <NodeOneLabelCell {data} {label}></NodeOneLabelCell>
{/each}