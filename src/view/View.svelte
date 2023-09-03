<script lang="ts">
    import type {RowHeader, ViewData} from "./type";
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
    import {getCypher} from "../data/graph";

    let cypher = getCypher()

    let query = "MATCH (n) RETURN n"

    async function _queryData(): Promise<ViewData> {
        const queryResult = await cypher.query(query)
        const headers: RowHeader[] = queryResult.keys.map(key => {
            return {
                name: key,
                description: key,
                key: key,
                type: "auto"
            }
        });
        return {
            headers: headers,
            rows: queryResult.records
        }
    }

    let dataAsync: Promise<ViewData>

    function queryData() {
        dataAsync = _queryData()
    }

    queryData()

</script>

<div>
    <Input id="search" bind:value={query} placeholder="Query">
        <Button slot="right" on:click={queryData}>Search</Button>
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
                            <Cell {header} data={row[header.key]}></Cell>
                        </TableBodyCell>
                    {/each}
                </TableBodyRow>
            {/each}
        </TableBody>
    </Table>
{/await}