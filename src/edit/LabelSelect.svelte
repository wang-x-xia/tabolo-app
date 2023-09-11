<script lang="ts">
    import {Button, Search} from "flowbite-svelte";
    import {getGraphMeta} from "../data/graph";
    import {asyncReadable} from "../util";
    import type {Readable} from "svelte/store";
    import {createEventDispatcher} from "svelte";


    const dispatch = createEventDispatcher<{ "addLabel": string }>();
    const graphMeta = getGraphMeta()

    const labels: Readable<string[]> = asyncReadable([], () => graphMeta.getLabels())

    let search = ""

    $: filteredLabels = $labels.filter(it => it.includes(search))

    function selectLabel(label: string) {
        dispatch("addLabel", label)
    }
</script>

<Search bind:value={search}></Search>
<div class="flex flex-wrap space-x-2">
    {#each filteredLabels as label}
        <Button on:click={() => selectLabel(label)} size="sm">{label}</Button>
    {/each}
</div>