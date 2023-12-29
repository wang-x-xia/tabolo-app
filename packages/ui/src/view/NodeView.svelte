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
    import type {GraphNode, NodeSearcher} from "tabolo-core";
    import {getGraph} from "../data/graph";
    import {getGraphEdit} from "../edit/graph-edit";
    import NodeSearch from "../search/NodeSearch.svelte";
    import NodeCell from "../cell/NodeCell.svelte";
    import {getViewHandler} from "./view";

    let graph = getGraph()
    let graphEdit = getGraphEdit()
    let viewHandler = getViewHandler()

    export let nodeSearcher: NodeSearcher
    // Seperated local data and input data
    let localSearcher: NodeSearcher

    /**
     * like $: localSearcher = JSON.parse(JSON.stringify(nodeSearcher))
     * But avoid link localSearcher with nodeSearcher
     * If linked, the update of localSearcher will also invalidate nodeSearcher and cause the update issue
     */
    async function updateInput() {
        localSearcher = JSON.parse(JSON.stringify(nodeSearcher))
        await queryData("NotUpdateView")
    }

    // $ won't be called during init.
    updateInput()

    $:{
        // $ bind the update of nodeSearcher
        if (nodeSearcher) {
            updateInput()
        }
    }

    let result: GraphNode[] | undefined

    async function queryData(updateView: "UpdateView" | "NotUpdateView" = "UpdateView") {
        if (updateView === "UpdateView") {
            await viewHandler.updateView({
                type: "NodeView",
                searcher: localSearcher
            })
        }
        result = await graph.searchNodes(localSearcher);
    }

    async function addNode() {
        let node = await graphEdit.newEmptyNode();
        await viewHandler.updateView({
            type: "NodeEditView",
            nodeId: node.id,
        })
    }

    queryData("NotUpdateView")

</script>

<ButtonGroup class="space-x-px">
    <Button color="primary" on:click={() =>queryData()}>Refresh</Button>
    <Button color="primary" on:click={addNode}>Add New Node</Button>
</ButtonGroup>
<NodeSearch bind:data={localSearcher}/>
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