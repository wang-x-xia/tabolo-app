<script lang="ts">
    import {
        Button,
        ButtonGroup,
        Popover,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell
    } from "flowbite-svelte";
    import PropertyValueCell from "./PropertyValueCell.svelte";
    import {idSelector, randomElementId} from "../util";
    import {nodeCellConfig} from "./node-cell";
    import type {GraphNode} from "../data/graph.js";

    export let data: GraphNode
    export let label: string

    const id = randomElementId("node-cell")

    const config = nodeCellConfig(label)

    $: entries = Object.entries(data.properties).sort(([a,], [b,]) => a.localeCompare(b))
</script>

<span {id}>
    {#if $config.type === "ShowLabel"}
        <Button size="sm">{label}</Button>
    {:else if $config.type === "ShowProperties"}
        <ButtonGroup size="sm" outline>
            <Button>{`<${label}>`}</Button>
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
<Popover title={`${label} Properties`} triggeredBy={idSelector(id)}>
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