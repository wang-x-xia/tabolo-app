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

    export let data: Node

    let id = "node-cell-" + randomElementId()
</script>


{#each data.labels as label}
    <Button id={`${id}_${label}`}>{label}</Button>
    <Popover title="Properties" triggeredBy={idSelector(`${id}_${label}`)}>
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
{/each}