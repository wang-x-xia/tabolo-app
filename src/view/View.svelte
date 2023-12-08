<script lang="ts">

    import {getTaboloUI} from "../data/ui";
    import NodeView from "./NodeView.svelte";
    import NodeEditView from "./NodeEditView.svelte";

    let taboloUI = getTaboloUI()

    let viewDataAsync = taboloUI.getView()
</script>

{#await viewDataAsync}
    Loading
{:then viewData}
    {#if (viewData.type === "NodeView") }
        <NodeView nodeSearcher={viewData.searcher}/>
    {:else if ((viewData.type === "NodeEditView"))}
        <NodeEditView data={viewData}></NodeEditView>
    {/if}
{/await}