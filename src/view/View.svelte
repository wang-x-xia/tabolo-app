<script lang="ts">
    import type {ViewData} from "./table-view";
    import {
        Button,
        ButtonGroup,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell
    } from "flowbite-svelte";
    import Cell from "../cell/Cell.svelte";
    import {getGraph} from "../data/graph";
    import {getGraphEdit} from "../edit/graph-edit";

    let graph = getGraph()
    let graphEdit = getGraphEdit()

    async function _queryData(): Promise<ViewData> {
        const nodes = await graph.searchNodes({
            type: "null",
            value: {},
        })
        return {
            headers: [
                {
                    name: "Node",
                    description: "Node",
                    key: "n",
                }
            ],
            rows: nodes.map(it => ({n: {type: "node", value: it}}))
        }
    }

    let dataAsync: Promise<ViewData>

    function queryData() {
        dataAsync = _queryData()
    }

    async function addNode() {
        await graphEdit.newEmptyNode()
    }

    queryData()

</script>

<ButtonGroup class="space-x-px">
    <Button color="primary" on:click={queryData}>Refresh</Button>
    <Button color="primary" on:click={addNode}>Add New Node</Button>
</ButtonGroup>
{#await dataAsync}
    Loading
{:then data}
    <Table divClass="min-h-max">
        <TableHead>
            {#each data.headers as header (header.key)}
                <TableHeadCell>{header.name}</TableHeadCell>
            {/each}
        </TableHead>
        <TableBody>
            {#each data.rows as row }
                <TableBodyRow>
                    {#each data.headers as header }
                        <TableBodyCell>
                            <Cell data={row[header.key]}></Cell>
                        </TableBodyCell>
                    {/each}
                </TableBodyRow>
            {/each}
        </TableBody>
    </Table>
{/await}