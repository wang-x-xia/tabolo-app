<script lang="ts">
    import type {GraphRelationship} from "tabolo-core";
    import {Button, ButtonGroup, Input, Label, Textarea} from "flowbite-svelte";
    import {getGraphEdit} from "./graph-edit";
    import {getViewHandler} from "../view/view";
    import TypeSelect from "./TypeSelect.svelte";
    import NodeSelect from "./NodeSelect.svelte";

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

    async function updateNodeId(pos: "Start" | "End", nodeId: string) {
        if (pos === "Start") {
            data = await graphEdit.editRelationshipStartNode(data.id, nodeId)
        } else {
            data = await graphEdit.editRelationshipEndNode(data.id, nodeId)
        }
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
    <TypeSelect on:type={e =>setType(e.detail)} source="Relationship" type={data.type}/>
    <Label class="mb-2 text-xl">Start Node</Label>
    <NodeSelect data={data.startNodeId} on:node={e => updateNodeId("Start", e.detail)}/>
    <Label class="mb-2 text-xl">End Node</Label>
    <NodeSelect data={data.endNodeId} on:node={e => updateNodeId("End", e.detail)}/>
    <Label class="mb-2 text-xl">Property</Label>
    <Textarea bind:value={property} class="h-40"/>
    <ButtonGroup>
        <Button color="primary" on:click={save}>Save</Button>
        <Button color="alternative" on:click={reset}>Reset</Button>
    </ButtonGroup>
</div>