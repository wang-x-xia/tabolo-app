<script lang="ts">
    import type {GraphNode} from "../data/graph.js";
    import {Button, ButtonGroup, Modal, Popover} from "flowbite-svelte";
    import NodeEdit from "../edit/NodeEdit.svelte";
    import PropertyValueCell from "./PropertyValueCell.svelte";
    import {idSelector, randomElementId} from "../util";
    import {nodeCellConfig} from "./node-cell";
    import {JSONPath} from "jsonpath-plus";
    import {DotsHorizontalOutline} from "flowbite-svelte-icons";

    export let data: GraphNode

    let editModal = false

    function done() {
        editModal = false
    }

    const id = randomElementId("node-cell")

    $: config = nodeCellConfig(data.type)
</script>

<ButtonGroup {id} size="sm" outline>
    <Button>{`<${data.type}>`}</Button>
    {#if $config.type === "ShowJsonPath"}
        {@const property = JSONPath({path: $config.jsonPath, json: data.properties, wrap: false})}
        {#if property === undefined}
            <Button>{$config.jsonPath}</Button>
        {:else }
            <Button>
                <PropertyValueCell data={property}/>
            </Button>
        {/if}
    {/if}
    <Button on:click={() => (editModal = true)}>
        <DotsHorizontalOutline/>
    </Button>
</ButtonGroup>
<Popover title={`${data.type} Properties`} triggeredBy={idSelector(id)}>
    {JSON.stringify(data.properties, null, 2)}
</Popover>

<Modal bind:open={editModal} title="Edit Node">
    <NodeEdit {data} {done}/>
</Modal>