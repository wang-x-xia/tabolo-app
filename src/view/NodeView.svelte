<script lang="ts">
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
    import type {GraphNode} from "../data/graph";
    import {getGraph} from "../data/graph";
    import {getGraphEdit} from "../edit/graph-edit";
    import NodeSearch from "../search/NodeSearch.svelte";
    import type {Readable} from "svelte/store";
    import type {ExtendableValue} from "../data/base";
    import {asSvelteReadable} from "../data/subscribe-svelte";
    import NodeCell from "../cell/NodeCell.svelte";
    import type {NodeSearcher} from "../data/node-searcher";
    import {emptySearcher} from "../data/searcher";

    let graph = getGraph()
    let graphEdit = getGraphEdit()
    let nodeSearcher: NodeSearcher = emptySearcher()

    let result: Readable<ExtendableValue<GraphNode[]>> | undefined

    async function queryData() {
        let value = await graph.searchNodes(nodeSearcher);
        result = asSvelteReadable(value);
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
<NodeSearch bind:data={nodeSearcher}/>
{#if result == null}
    Loading
{:else}
    <Table divClass="min-h-max">
        <TableHead>
            <TableHeadCell>Node</TableHeadCell>
        </TableHead>
        <TableBody>
            {#each $result.value as node (node.id) }
                <TableBodyRow>
                    <TableBodyCell>
                        <NodeCell data={node}/>
                    </TableBodyCell>
                </TableBodyRow>
            {/each}
        </TableBody>
    </Table>
{/if}