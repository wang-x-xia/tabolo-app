<script lang="ts">
    import type {LabelSearcher} from "../data/graph";
    import {Button, ButtonGroup, Modal} from "flowbite-svelte";
    import LabelSelect from "../edit/LabelSelect.svelte";
    import {SearchOutline} from "flowbite-svelte-icons";

    export let data: LabelSearcher

    let showAddLabel = false

    function selectLabel(label: string) {
        data.label = label;
        showAddLabel = false;
    }
</script>

<ButtonGroup size="sm">
    {#if data.label}
        <Button>{data.label}</Button>
    {/if}
    <Button on:click={() => showAddLabel = true}>
        <SearchOutline/>
    </Button>
</ButtonGroup>

<Modal bind:open={showAddLabel} title="Select Label">
    <LabelSelect on:addLabel={e =>selectLabel(e.detail)}/>
</Modal>