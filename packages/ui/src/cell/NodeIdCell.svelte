<script lang="ts">
    import {getGraph} from "../data/graph";
    import NodeCell from "./NodeCell.svelte";

    export let data: string

    let graph = getGraph()

    $: nodeAsync = graph.getNode(data)
</script>

{#await nodeAsync}
    Loading {data}
{:then node}
    <NodeCell data={node}/>
{:catch e}
    Not found {data}
{/await}