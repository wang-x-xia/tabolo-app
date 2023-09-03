<script lang="ts">
    import {
        Button,
        Popover,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell
    } from "flowbite-svelte";
    import PrimitiveCell from "./PrimitiveCell.svelte";
    import {idSelector, randomElementId} from "../util";
    import {nodeCellConfig} from "./node-cell";
    import type {GraphNode} from "../data/graph.js";

    export let data: GraphNode
    export let label: string

    let id = "node-cell-" + randomElementId()

    let config = nodeCellConfig(label)
</script>

<span {id}>
    {#if $config.type === "ShowLabel"}
        <Button size="sm">{label}</Button>
    {:else if $config.type === "ShowOneField"}
        <Button size="sm" outline>
            {`<${label}>`}
            <PrimitiveCell data={data.properties[$config.key]}/>
        </Button>
    {/if}
</span>
<Popover title={`${label} Properties`} triggeredBy={idSelector(id)}>
    <Table>
        <TableHead>
            <TableHeadCell>Key</TableHeadCell>
            <TableHeadCell>Value</TableHeadCell>
        </TableHead>
        <TableBody>
            {#each Object.entries(data.properties) as [key, value] }
                <TableBodyRow>
                    <TableBodyCell>{key}</TableBodyCell>
                    <TableBodyCell>
                        <PrimitiveCell data={value}></PrimitiveCell>
                    </TableBodyCell>
                </TableBodyRow>
            {/each}
        </TableBody>
    </Table>
</Popover>