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
    import type {GraphRelationship} from "../data/graph";
    import {getGraph} from "../data/graph";
    import type {Readable} from "svelte/store";
    import type {ExtendableValue} from "../data/base";
    import {asSvelteReadable} from "../data/subscribe-svelte";
    import {emptySearcher} from "../data/searcher";
    import type {RelationshipSearcher} from "../data/relationship-searcher";
    import RelationshipCell from "../cell/RelationshipCell.svelte";
    import NodeIdCell from "../cell/NodeIdCell.svelte";

    let graph = getGraph()
    let relationshipSearcher: RelationshipSearcher = emptySearcher()

    let result: Readable<ExtendableValue<GraphRelationship[]>> | undefined

    async function queryData() {
        let value = await graph.searchRelationships(relationshipSearcher);
        result = asSvelteReadable(value);
    }


    queryData()

</script>

<ButtonGroup class="space-x-px">
    <Button color="primary" on:click={queryData}>Refresh</Button>
</ButtonGroup>
{#if result == null}
    Loading
{:else}
    <Table divClass="min-h-max">
        <TableHead>
            <TableHeadCell>Start Node</TableHeadCell>
            <TableHeadCell>Relationship</TableHeadCell>
            <TableHeadCell>End Node</TableHeadCell>
        </TableHead>
        <TableBody>
            {#each $result.value as node (node.id) }
                <TableBodyRow>
                    <TableBodyCell>
                        <NodeIdCell data={node.startNodeId}/>
                    </TableBodyCell>
                    <TableBodyCell>
                        <RelationshipCell data={node}/>
                    </TableBodyCell>
                    <TableBodyCell>
                        <NodeIdCell data={node.endNodeId}/>
                    </TableBodyCell>
                </TableBodyRow>
            {/each}
        </TableBody>
    </Table>
{/if}