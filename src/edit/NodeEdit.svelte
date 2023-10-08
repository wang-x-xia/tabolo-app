<script lang="ts">
    import type {GraphNode} from "../data/graph";
    import PropertyEdit from "./PropertyEdit.svelte";
    import {Button, ButtonGroup, Input, Label, Modal} from "flowbite-svelte";
    import {CloseSolid, PlusSolid} from "flowbite-svelte-icons";
    import LabelSelect from "./LabelSelect.svelte";
    import {getGraphEdit} from "./graph-edit";
    import type {GraphNodeEditHandler} from "./node-edit";

    const graphEdit = getGraphEdit()

    export let data: GraphNode
    export let done: () => void

    let handler: GraphNodeEditHandler = graphEdit.nodeEditHandler(data)
    $:({labels, remains, propertyHandlers} = handler)

    let showAddLabel = false

    async function save() {
        handler = await handler.save()
        done()
    }

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
        handler = await handler.reset()
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

<form class="space-y-6" on:submit|preventDefault={save}>
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
        <Button type="submit">Save</Button>
        <Button color="alternative" on:click={reset} type="button">Reset</Button>
    </div>
</form>
<Modal bind:open={showAddLabel} title="Select Label">
    <LabelSelect on:addLabel={e =>addLabel(e.detail)}/>
</Modal>