<script lang="ts">
    import {Button, ButtonGroup, Modal} from "flowbite-svelte";
    import {SearchOutline} from "flowbite-svelte-icons";
    import type {TypeSearcher} from "../data/searcher";
    import NodeTypeSelect from "../edit/NodeTypeSelect.svelte";

    export let data: TypeSearcher

    let showSelectType = false

    function selectType(type: string) {
        data.value = type;
        showSelectType = false;
    }
</script>

<ButtonGroup size="sm">
    {#if data.value}
        <Button>{data.value}</Button>
    {/if}
    <Button on:click={() => showSelectType = true}>
        <SearchOutline/>
    </Button>
</ButtonGroup>

<Modal bind:open={showSelectType} title="Select Type">
    <NodeTypeSelect on:type={e =>selectType(e.detail)}/>
</Modal>