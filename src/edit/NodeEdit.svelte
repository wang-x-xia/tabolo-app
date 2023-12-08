<script lang="ts">
    import type {GraphNode} from "../data/graph";
    import {Button, ButtonGroup, Input, Label, Textarea} from "flowbite-svelte";
    import {CloseSolid} from "flowbite-svelte-icons";
    import NodeTypeSelect from "./NodeTypeSelect.svelte";
    import {getGraphEdit} from "./graph-edit";

    const graphEdit = getGraphEdit()

    export let data: GraphNode

    let property: string

    async function reset() {
        property = JSON.stringify(data.properties)
    }

    reset()

    async function setType(type: string) {
        data = await graphEdit.editNodeType(data.id, type)
    }

    async function removeNode() {
        await graphEdit.removeNode(data.id)
    }

    async function copy() {
        await graphEdit.copyNode(data.id);
    }

    async function save() {
        data = await graphEdit.editNodeProperty(data.id, JSON.parse(property))
    }
</script>

<div>
    <Label class="mb-2">Node ID</Label>
    <ButtonGroup class="w-full">
        <Input disabled value={data.id}/>
        <Button color="primary" on:click={removeNode}>
            <CloseSolid size="sm"/>
        </Button>
    </ButtonGroup>
</div>
<div>
    <Label class="mb-2">Type</Label>
    <NodeTypeSelect type={data.type} on:type={e =>setType(e.detail)}/>
</div>
<div>
    <Label class="mb-2">Property</Label>
    <ButtonGroup class="w-full">
        <Textarea bind:value={property}/>
    </ButtonGroup>
</div>
<div class="space-x-4">
    <Button color="primary" on:click={save}>Save</Button>
    <Button color="alternative" on:click={reset}>Reset</Button>
    <Button on:click={copy}>Copy</Button>
</div>