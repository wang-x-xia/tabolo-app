<script lang="ts">
    import type {ViewData} from "./table-view";
    import {
        Button,
        Input,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell
    } from "flowbite-svelte";
    import Cell from "../cell/Cell.svelte";
    import {getCypher, getGraph} from "../data/graph";

    let cypher = getCypher()
    let graph = getGraph()

    let query = "MATCH (n) RETURN n"

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

    queryData()

</script>

<div>
    <Input bind:value={query} id="search" placeholder="Query">
        <Button on:click={queryData} slot="right">Search</Button>
    </Input>
</div>
{#await dataAsync}
    Loading
{:then data}
    <Table>
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