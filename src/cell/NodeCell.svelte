<script lang="ts">
    import NodeOneLabelCell from "./NodeOneLabelCell.svelte";
    import type {GraphNode} from "../data/graph.js";
    import {Modal} from "flowbite-svelte";
    import NodeEdit from "../edit/NodeEdit.svelte";

    export let data: GraphNode

    let editModal = false

    function done() {
        editModal = false
    }
</script>


<span on:dblclick|preventDefault={() => (editModal = true)}>
{#each data.labels as label}
    <NodeOneLabelCell {data} {label}></NodeOneLabelCell>
{:else }
    <NodeOneLabelCell {data} label="Null"></NodeOneLabelCell>
{/each}
</span>

<Modal bind:open={editModal} title="Edit Node">
    <NodeEdit {data} {done}/>
</Modal>