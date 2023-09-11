<script lang="ts">
    import type {GraphNode} from "../data/graph";
    import {copyGraphNode, getGraph, getGraphMeta} from "../data/graph";
    import type {NodeEditConfig} from "./node-edit"
    import {nodeEditConfig, remainsProperties} from "./node-edit";
    import PropertyEdit from "./PropertyEdit.svelte";
    import {Accordion, AccordionItem, Button, ButtonGroup, Input, Label, Modal} from "flowbite-svelte";
    import {PlusSolid} from "flowbite-svelte-icons";
    import type {Readable} from "svelte/store";
    import LabelSelect from "./LabelSelect.svelte";

    const meta = getGraphMeta()

    export let data: GraphNode

    let draft: GraphNode
    let config: Readable<NodeEditConfig>
    let showAddLabel = false


    function reset() {
        config = nodeEditConfig(data.labels, meta)
        draft = copyGraphNode(data)
        showAddLabel = false
    }

    reset()

    const graph = getGraph()

    $:remains = remainsProperties($config, draft)

    async function save() {
        data = await graph.editNode(data.id, draft.properties, data.properties)
        reset()
    }


    async function addLabel(label: string) {
        if (draft.labels.indexOf(label) >= 0) {
            return
        }
        data = await graph.addLabelToNode(data.id, label)
        reset()
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
            {#each $config.labels as [label, _]}
                <Button color="primary">{label}</Button>
            {/each}
            <Button on:click={() => (showAddLabel = true)}>
                <PlusSolid size="sm"/>
            </Button>
        </ButtonGroup>
    </div>
    <!-- Key here to reload all component if config/remains changed -->
    <!-- If not, some of AccordionItem wont be opened -->
    {#key $config}
        <Accordion multiple>
            {#each $config.labels as [label, properties]}
                <AccordionItem open paddingDefault="p-4">
                    <span slot="header">{label}</span>
                    <div class="space-y-6">
                        {#each properties as property}
                            <PropertyEdit {property} bind:value={draft.properties[property.key]}/>
                        {/each}
                    </div>
                </AccordionItem>
            {/each}
            {#if (remains.length > 0)}
                <AccordionItem open paddingDefault="p-4">
                    <span slot="header">Remaining</span>
                    <div class="space-y-6">
                        {#each remains as key}
                            <PropertyEdit {key} bind:value={draft.properties[key]}/>
                        {/each}
                    </div>
                </AccordionItem>
            {/if}
        </Accordion>
    {/key}
    <div class="space-x-4">
        <Button type="submit">Save</Button>
        <Button type="button" color="alternative" on:click={reset}>Reset</Button>
    </div>
</form>
<Modal title="Select Label" bind:open={showAddLabel}>
    <LabelSelect on:addLabel={e =>addLabel(e.detail)}/>
</Modal>