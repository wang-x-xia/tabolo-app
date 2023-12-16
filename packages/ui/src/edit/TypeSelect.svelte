<script lang="ts">
    import {Button, ButtonGroup, Listgroup, ListgroupItem, Search} from "flowbite-svelte";
    import {getGraphMeta} from "../data/graph";
    import {asyncReadable} from "../util";
    import type {Readable} from "svelte/store";
    import {createEventDispatcher} from "svelte";
    import {EditOutline} from "flowbite-svelte-icons";


    const dispatch = createEventDispatcher<{ "type": string }>();
    const graphMeta = getGraphMeta()


    export let source: "Node" | "Relationship"
    export let type: string;

    const types: Readable<string[]> = asyncReadable([], () => {
        if (source === "Node") {
            return graphMeta.getNodeTypes()
        } else {
            return graphMeta.getRelationshipTypes()
        }
    })

    let search = type
    let edit = false

    $: filteredTypes = $types.filter(it => it.includes(search))

    function selectType(newType: string) {
        type = newType;
        dispatch("type", newType)
        edit = false;
    }
</script>

{#if (edit)}
    <Search bind:value={search}></Search>
    <Listgroup class="absolute overflow-y-auto max-h-48">
        {#each filteredTypes as type}
            <ListgroupItem>
                <button on:click={() => selectType(type)}>
                    {type}
                </button>
            </ListgroupItem>
        {/each}
    </Listgroup>
{:else }
    <ButtonGroup>
        <Button>{type}</Button>
        <Button on:click={()=>{edit = true}}>
            <EditOutline/>
        </Button>
    </ButtonGroup>
{/if}
