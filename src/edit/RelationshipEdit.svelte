<script lang="ts">
    import {getGraph, type GraphRelationship} from "../data/graph";
    import {Button, ButtonGroup, Input, Label, Textarea} from "flowbite-svelte";
    import {getGraphEdit} from "./graph-edit";
    import {getViewHandler} from "../view/view";
    import NodeIdCell from "../cell/NodeIdCell.svelte";
    import TypeSelect from "./TypeSelect.svelte";

    const graph = getGraph()
    const graphEdit = getGraphEdit()
    const viewHandler = getViewHandler()

    export let data: GraphRelationship

    let property: string

    async function reset() {
        property = JSON.stringify(data.properties)
    }

    reset()

    async function setType(type: string) {
        data = await graphEdit.editRelationshipType(data.id, type)
    }

    async function remove() {
        await graphEdit.removeRelationship(data.id)
        history.back()
    }

    async function copy() {
        let relationship = await graphEdit.copyRelationship(data.id);
        await viewHandler.updateView({
            "type": "RelationshipEditView",
            "relationshipId": relationship.id
        });
    }

    async function save() {
        data = await graphEdit.editRelationshipProperty(data.id, JSON.parse(property))
    }

</script>

<div class="w-full max-w-3xl space-y-4">
    <Label class="mb-2 text-xl">Relationship ID</Label>
    <Input disabled value={data.id}/>
    <Label class="mb-2 text-xl">Action</Label>
    <ButtonGroup>
        <Button on:click={copy}>Copy</Button>
        <Button on:click={remove}>Delete</Button>
    </ButtonGroup>
    <Label class="mb-2 text-xl">Type</Label>
    <TypeSelect source="Relationship" on:type={e =>setType(e.detail)} type={data.type}/>
    <Label class="mb-2 text-xl">Start Node</Label>
    <NodeIdCell data={data.startNodeId}/>
    <Label class="mb-2 text-xl">End Node</Label>
    <NodeIdCell data={data.endNodeId}/>
    <Label class="mb-2 text-xl">Property</Label>
    <Textarea class="h-40" bind:value={property}/>
    <ButtonGroup>
        <Button color="primary" on:click={save}>Save</Button>
        <Button color="alternative" on:click={reset}>Reset</Button>
    </ButtonGroup>
</div>