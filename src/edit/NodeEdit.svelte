<script lang="ts">
    import type {GraphNode} from "../data/graph";
    import PropertyEdit from "./PropertyEdit.svelte";
    import {Button, ButtonGroup, Input, Label, Modal} from "flowbite-svelte";
    import {CloseSolid, PlusSolid} from "flowbite-svelte-icons";
    import LabelSelect from "./LabelSelect.svelte";
    import {getGraphEdit, getGraphEditHandler} from "./graph-edit";
    import type {GraphNodeEditHandler} from "./node-edit";

    const graphEdit = getGraphEdit()
    const graphEditHandler = getGraphEditHandler()

    export let data: GraphNode
    export let done: () => void

    let handler: GraphNodeEditHandler = graphEditHandler.node(data, graphEdit)
    $:({labels, remains, propertyHandlers} = handler)

    let showAddLabel = false

    async function addLabel(label: string) {
        handler = await handler.addLabel(label)
        showAddLabel = false
    }

    async function removeLabel(label: string) {
        handler = await handler.removeLabel(label)
    }

    async function removeNode() {
        await graphEdit.removeNode(data.id)
        done()
    }

    async function reset() {
        handler = await handler.reset(data)
    }

    async function copy() {
        await graphEdit.copyNode(data.id);
    }

    let newKey = ""

    async function addProperty() {
        if (newKey == "") {
            return
        }
        handler = await handler.addProperty(newKey)
        newKey = ""
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
    <Label class="mb-2">Labels</Label>
    <div class="flex space-x-2">
        {#each labels as label}
            <ButtonGroup class="space-x-px">
                <Button color="primary">{label}</Button>
                <Button color="primary" on:click={() => removeLabel(label)}>
                    <CloseSolid size="sm"/>
                </Button>
            </ButtonGroup>
        {/each}
        <Button on:click={() => (showAddLabel = true)}>
            <PlusSolid size="sm"/>
        </Button>
    </div>
</div>
<div class="space-y-6">
    <div>
        <Label class="mb-2">New Key</Label>
        <ButtonGroup class="w-full">
            <Input bind:value={newKey}/>
            <Button color="primary" on:click={addProperty}>
                <PlusSolid size="sm"/>
            </Button>
        </ButtonGroup>
    </div>
    {#each remains as key}
        <PropertyEdit data={propertyHandlers[key]}/>
    {/each}
</div>
<div class="space-x-4">
    <Button color="alternative" on:click={reset}>Reset</Button>
    <Button on:click={copy}>Copy</Button>
</div>
<Modal bind:open={showAddLabel} title="Select Label">
    <LabelSelect on:addLabel={e =>addLabel(e.detail)}/>
</Modal>