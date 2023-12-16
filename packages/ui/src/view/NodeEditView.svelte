<script lang="ts">

    import NodeEdit from "../edit/NodeEdit.svelte";
    import {getGraph} from "../data/graph";
    import type {NodeEditViewData} from "./view";

    let graph = getGraph()

    export let data: NodeEditViewData

    $: nodeAsync = graph.getNode(data.nodeId)

</script>

<div class="w-full flex justify-center">
    {#await nodeAsync}
        Loading
    {:then node}
        <NodeEdit data={node}></NodeEdit>
    {/await}
</div>