<script lang="ts">
    import type {GraphNode} from "../data/graph.js";
    import {
        Button,
        ButtonGroup,
        Modal,
        Popover,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell
    } from "flowbite-svelte";
    import NodeEdit from "../edit/NodeEdit.svelte";
    import PropertyValueCell from "./PropertyValueCell.svelte";
    import {idSelector, randomElementId} from "../util";
    import {nodeCellConfig} from "./node-cell";

    export let data: GraphNode

    let editModal = false

    function done() {
        editModal = false
    }

    const id = randomElementId("node-cell")

    $: config = nodeCellConfig(data.type)

    $: entries = Object.entries(data.properties).sort(([a,], [b,]) => a.localeCompare(b))
</script>

<span {id} on:dblclick|preventDefault={() => (editModal = true)} role="button" tabindex="0">
    {#if $config.type === "ShowType"}
        <Button size="sm">{data.type}</Button>
    {:else if $config.type === "ShowProperties"}
        <ButtonGroup size="sm" outline>
            <Button>{`<${data.type}>`}</Button>
            {#each $config.keys as key }
                {#if data.properties[key]}
                    <Button>
                        <PropertyValueCell data={data.properties[key]}/>
                    </Button>
                {:else }
                    <Button>{key + "<Empty>"}</Button>
                {/if}
            {/each}
        </ButtonGroup>
    {/if}
</span>
<Popover title={`${data.type} Properties`} triggeredBy={idSelector(id)}>
    <Table>
        <TableHead>
            <TableHeadCell>Key</TableHeadCell>
            <TableHeadCell>Value</TableHeadCell>
        </TableHead>
        <TableBody>
            {#each entries as [key, value] }
                <TableBodyRow>
                    <TableBodyCell>{key}</TableBodyCell>
                    <TableBodyCell>
                        <PropertyValueCell data={value}></PropertyValueCell>
                    </TableBodyCell>
                </TableBodyRow>
            {/each}
        </TableBody>
    </Table>
</Popover>

<Modal bind:open={editModal} title="Edit Node">
    <NodeEdit {data} {done}/>
</Modal>