<script lang="ts">
    import {Button, Search} from "flowbite-svelte";
    import {getGraphMeta} from "../data/graph";
    import {asyncReadable} from "../util";
    import type {Readable} from "svelte/store";
    import {createEventDispatcher} from "svelte";


    const dispatch = createEventDispatcher<{ "type": string }>();
    const graphMeta = getGraphMeta()

    const types: Readable<string[]> = asyncReadable([], () => graphMeta.getNodeTypes())

    let search = ""

    $: filteredTypes = $types.filter(it => it.includes(search))

    function selectType(type: string) {
        dispatch("type", type)
    }
</script>

<Search bind:value={search}></Search>
<div class="flex flex-wrap space-x-2">
    {#each filteredTypes as type}
        <Button on:click={() => selectType(type)} size="sm">{type}</Button>
    {/each}
</div>