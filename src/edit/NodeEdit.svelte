<script lang="ts">
    import type {GraphNode} from "../data/graph";
    import PropertyEdit from "./PropertyEdit.svelte";
    import {Button, ButtonGroup, Input, Label, Modal} from "flowbite-svelte";
    import {PlusSolid} from "flowbite-svelte-icons";
    import LabelSelect from "./LabelSelect.svelte";
    import {getGraphEdit} from "./graph-edit";
    import type {GraphNodeEditHandler} from "./node-edit";

    const graphEdit = getGraphEdit()

    export let data: GraphNode

    let handler: GraphNodeEditHandler = graphEdit.nodeEditHandler(data)
    $:({labels, remains, propertyHandlers} = handler)

    let showAddLabel = false

    async function save() {
        handler = await handler.save()
    }

    async function addLabel(label: string) {
        handler = await handler.addLabel(label)
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
        <Input disabled value={data.id}/>
    </div>
    <div>
        <Label class="mb-2">Labels</Label>
        <ButtonGroup>
            {#each labels as label}
                <Button color="primary">{label}</Button>
            {/each}
            <Button on:click={() => (showAddLabel = true)}>
                <PlusSolid size="sm"/>
            </Button>
        </ButtonGroup>
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