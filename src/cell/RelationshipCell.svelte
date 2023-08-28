<script lang="ts">
    import {Relationship} from "neo4j-driver";
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

    export let data: Relationship

    let id = "relationship-cell-" + randomElementId()
</script>

<Button {id}>{data.type}</Button>
<Popover title="Properties" triggeredBy={idSelector(id)}>
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
