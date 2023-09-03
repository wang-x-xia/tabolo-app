<script lang="ts">
    import type {GraphNode} from "../data/graph";
    import {copyGraphNode} from "../data/graph";
    import type {NodeEditConfig} from "./node-edit";
    import {nodeEditConfig} from "./node-edit";
    import PropertyEdit from "./PropertyEdit.svelte";
    import {Accordion, AccordionItem, Button, ButtonGroup, Input, Label} from "flowbite-svelte";
    import {PlusSolid} from "flowbite-svelte-icons";
    import type {Readable} from "svelte/store";
    import {derived} from "svelte/store";

    export let data: GraphNode

    let draft = copyGraphNode(data)

    const config = nodeEditConfig(data.labels)

    const remains = derived<Readable<NodeEditConfig>, string[]>(config, (value, set) => {
        const keys = new Set(Object.keys(draft.properties));
        value.labels.forEach(([_, value]) => {
            value.forEach(p => {
                keys.delete(p.key)
            })
        })
        const list = Array.from(keys)
        list.sort()
        set(list)
    })
</script>

<form class="space-y-6">
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
            <Button>
                <PlusSolid size="sm"/>
            </Button>
        </ButtonGroup>
    </div>
    <!-- Key here to reload all component if config/remains changed -->
    <!-- If not, some of AccordionItem wont be opened -->
    {#key $config}
        {#key $remains}
            <Accordion>
                {#each $config.labels as [label, properties]}
                    <AccordionItem open paddingDefault="p-4">
                        <span slot="header">{label}</span>
                        <div class="space-y-6">
                            {#each properties as property}
                                {#key draft}
                                    <PropertyEdit {property} {draft}/>
                                {/key}
                            {/each}
                        </div>
                    </AccordionItem>
                {/each}
                {#if ($remains.length > 0)}
                    <AccordionItem open paddingDefault="p-4">
                        <span slot="header">Remaining</span>
                        <div class="space-y-6">
                            {#each $remains as key}
                                {#key draft}
                                    <PropertyEdit {key} {draft}/>
                                {/key}
                            {/each}
                        </div>
                    </AccordionItem>
                {/if}
            </Accordion>
        {/key}
    {/key}
    <div class="space-x-4">
        <Button>Save</Button>
        <Button type="button" color="alternative" on:click={() =>(draft = {...data})}>Reset</Button>
    </div>
</form>