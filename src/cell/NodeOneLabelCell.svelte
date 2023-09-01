<script lang="ts">
    import {Node} from "neo4j-driver";
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

    export let data: Node
    export let label: string

    let id = "node-cell-" + randomElementId()

    let config = nodeCellConfig(label)
</script>

{#if $config.type === "ShowLabel"}
    <Button {id} size="sm">{label}</Button>
{:else if $config.type === "ShowOneField"}
    <Button {id} size="sm" outline>
        {`<${label}>`}
        <PrimitiveCell data={data.properties[$config.key]}/>
    </Button>
{/if}
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