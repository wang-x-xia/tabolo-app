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
    import NodeCell from "../cell/NodeCell.svelte";
    import type {NodeSearcher} from "../data/node-searcher";
    import {getTaboloUI} from "../data/ui";

    let graph = getGraph()
    let graphEdit = getGraphEdit()
    let taboloUI = getTaboloUI()

    export let nodeSearcher: NodeSearcher

    let result: GraphNode[] | undefined

    async function queryData() {
        await taboloUI.updateView({
            type: "NodeView",
            searcher: nodeSearcher
        })
        result = await graph.searchNodes(nodeSearcher);
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
            {#each result as node (node.id)}
                <TableBodyRow>
                    <TableBodyCell>
                        <NodeCell data={node}/>
                    </TableBodyCell>
                </TableBodyRow>
            {/each}
        </TableBody>
    </Table>
{/if}