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
    import PropertyValueCell from "./PropertyValueCell.svelte";
    import {idSelector, randomElementId} from "../util";
    import type {GraphRelationship} from "../data/graph";
    import {getGraph} from "../data/graph";
    import NodeCell from "./NodeCell.svelte";

    export let data: GraphRelationship
    let graph = getGraph()

    $: startNodeAsync = graph.getNode(data.startNodeId)
    $: endNodeAsync = graph.getNode(data.endNodeId)

    const id = randomElementId("relationship-cell")
</script>

<Button {id}>{data.type}</Button>
<Popover title="Properties" triggeredBy={idSelector(id)}>
    {#await startNodeAsync}
        Loading
    {:then startNode}
        <NodeCell data={startNode}/>
    {/await}
    {"->"}
    {#await endNodeAsync}
        Loading
    {:then endNode}
        <NodeCell data={endNode}/>
    {/await}
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
                        <PropertyValueCell data={value}></PropertyValueCell>
                    </TableBodyCell>
                </TableBodyRow>
            {/each}
        </TableBody>
    </Table>
</Popover>
