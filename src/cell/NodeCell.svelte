<script lang="ts">
    import type {GraphNode} from "../data/graph.js";
    import {Button, ButtonGroup, Modal, Popover} from "flowbite-svelte";
    import NodeEdit from "../edit/NodeEdit.svelte";
    import PropertyValueCell from "./PropertyValueCell.svelte";
    import {idSelector, randomElementId} from "../util";
    import {nodeCellConfig} from "./node-cell";
    import {JSONPath} from "jsonpath-plus";

    export let data: GraphNode

    let editModal = false

    function done() {
        editModal = false
    }

    const id = randomElementId("node-cell")

    $: config = nodeCellConfig(data.type)
</script>

<span {id} on:dblclick|preventDefault={() => (editModal = true)} role="button" tabindex="0">
    {#if $config.type === "ShowType"}
        <Button size="sm">{data.type}</Button>
    {:else if $config.type === "ShowJsonPath"}
        <ButtonGroup size="sm" outline>
            <Button>{`<${data.type}>`}</Button>
            {@const property = JSONPath({path: $config.jsonPath, json: data.properties, wrap: false})}
            {#if property === undefined}
                <Button>{$config.jsonPath}</Button>
            {:else }
                <Button>
                    <PropertyValueCell data={property}/>
                </Button>
            {/if}
        </ButtonGroup>
    {/if}
</span>
<Popover title={`${data.type} Properties`} triggeredBy={idSelector(id)}>
    {JSON.stringify(data.properties, null, 2)}
</Popover>

<Modal bind:open={editModal} title="Edit Node">
    <NodeEdit {data} {done}/>
</Modal>