<script lang="ts">
    import type {GraphNode, NodeSearcher} from "tabolo-core";
    import {emptySearcher} from "tabolo-core";
    import NodeIdCell from "../cell/NodeIdCell.svelte";
    import {Button, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell} from "flowbite-svelte";
    import {EditOutline} from "flowbite-svelte-icons";
    import NodeSearch from "../search/NodeSearch.svelte";
    import NodeCell from "../cell/NodeCell.svelte";
    import {createEventDispatcher} from "svelte";
    import {getGraph} from "../data/graph";

    const graph = getGraph()
    const dispatch = createEventDispatcher<{ "node": string }>();

    let nodeSearcher: NodeSearcher = emptySearcher()

    let result: GraphNode[] | undefined

    async function queryData() {
        result = await graph.searchNodes(nodeSearcher);
    }

    async function select(node: GraphNode) {
        data = node.id
        dispatch("node", node.id)
        edit = false
    }

    export let data: string

    let edit = false
</script>

{#if (edit)}
    <NodeSearch bind:data={nodeSearcher}></NodeSearch>
    <Button on:click={queryData}>Search</Button>
    {#if result == null}
        Loading
    {:else}
        <Table divClass="min-h-max">
            <TableHead>
                <TableHeadCell>Node</TableHeadCell>
                <TableHeadCell>Action</TableHeadCell>
            </TableHead>
            <TableBody>
                {#each result as node (node.id)}
                    <TableBodyRow>
                        <TableBodyCell>
                            <NodeCell data={node}/>
                        </TableBodyCell>
                        <TableBodyCell>
                            <Button on:click={()=> {select(node)}}>Select</Button>
                        </TableBodyCell>
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {/if}
{:else }
    <div class="w-full flex justify-between">
        <NodeIdCell {data}></NodeIdCell>
        <Button on:click={()=>{edit = true}}>
            <EditOutline/>
        </Button>
    </div>
{/if}
