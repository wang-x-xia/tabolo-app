<script lang="ts">
    import {type GraphNode, type GraphRelationship, relationshipNodeSearcher} from "tabolo-core";
    import {Button, ButtonGroup, Input, Label, Textarea} from "flowbite-svelte";
    import TypeSelect from "./TypeSelect.svelte";
    import {getGraphEdit} from "./graph-edit";
    import {getViewHandler} from "../view/view";
    import RelationshipCell from "../cell/RelationshipCell.svelte";
    import NodeIdCell from "../cell/NodeIdCell.svelte";
    import {getGraph} from "../data/graph";

    const graph = getGraph()
    const graphEdit = getGraphEdit()
    const viewHandler = getViewHandler()

    export let data: GraphNode

    let property: string

    async function reset() {
        property = JSON.stringify(data.properties)
    }

    reset()

    async function setType(type: string) {
        data = await graphEdit.editNodeType(data.id, type)
    }

    async function remove() {
        await graphEdit.removeNode(data.id)
        history.back()
    }

    async function copy() {
        let node = await graphEdit.copyNode(data.id);
        await viewHandler.updateView({
            "type": "NodeEditView",
            "nodeId": node.id
        });
    }

    async function save() {
        data = await graphEdit.editNodeProperty(data.id, JSON.parse(property))
    }

    let relationships: GraphRelationship[] = []

    async function setup() {
        relationships = await graph.searchRelationships(relationshipNodeSearcher(data.id))
    }

    async function createRelationship() {
        await graphEdit.newEmptyRelationship(data.id, data.id)
        await setup()
    }

    setup()
</script>

<div class="w-full max-w-3xl space-y-4">
    <Label class="mb-2 text-xl">Node ID</Label>
    <Input disabled value={data.id}/>
    <Label class="mb-2 text-xl">Action</Label>
    <ButtonGroup>
        <Button on:click={copy}>Copy</Button>
        <Button on:click={remove}>Delete</Button>
    </ButtonGroup>
    <Label class="mb-2 text-xl">Type</Label>
    <TypeSelect on:type={e =>setType(e.detail)} source="Node" type={data.type}/>
    <Label class="mb-2 text-xl">Property</Label>
    <Textarea bind:value={property} class="h-40"/>
    <ButtonGroup>
        <Button color="primary" on:click={save}>Save</Button>
        <Button color="alternative" on:click={reset}>Reset</Button>
    </ButtonGroup>
    {#if (relationships.length) === 0}
        <Label class="mb-2 text-xl">No Relationship</Label>
    {:else }
        <Label class="mb-2 text-xl">Relationships</Label>
        {#each relationships as relationship}
            <div>
                {#if (relationship.startNodeId !== data.id)}
                    <NodeIdCell data={relationship.startNodeId}/>
                {/if}
                <RelationshipCell data={relationship}/>
                {#if (relationship.endNodeId !== data.id)}
                    <NodeIdCell data={relationship.endNodeId}/>
                {/if}
            </div>
        {/each}
    {/if}
    <ButtonGroup>
        <Button on:click={createRelationship}>New Relationship</Button>
    </ButtonGroup>
</div>