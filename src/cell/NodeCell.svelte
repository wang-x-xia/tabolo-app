<script lang="ts">
    import type {GraphNode} from "../data/graph.js";
    import {Button, ButtonGroup, Popover} from "flowbite-svelte";
    import PropertyValueCell from "./PropertyValueCell.svelte";
    import {idSelector, randomElementId} from "../util";
    import {nodeCellConfig} from "./node-cell";
    import {JSONPath} from "jsonpath-plus";
    import {DotsHorizontalOutline} from "flowbite-svelte-icons";
    import {getTaboloUI} from "../data/ui";

    export let data: GraphNode

    let taboloUI = getTaboloUI()

    function editNode() {
        taboloUI.updateView({
            type: "NodeEditView",
            nodeId: data.id,
        })
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
    <Button on:click={editNode}>
        <DotsHorizontalOutline/>
    </Button>
</ButtonGroup>
<Popover title={`${data.type} Properties`} triggeredBy={idSelector(id)}>
    {JSON.stringify(data.properties, null, 2)}
</Popover>
