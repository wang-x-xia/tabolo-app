<script lang="ts">
    import NodeTypeSearch from "./NodeTypeSearch.svelte";
    import NodeEqSearch from "./NodeEqSearch.svelte";
    import NodeMatchAllSearch from "./NodeMatchAllSearch.svelte";
    import {Select} from "flowbite-svelte";
    import type {NodeSearcher} from "tabolo-core";
    import {emptySearcher} from "tabolo-core";

    export let data: NodeSearcher

    $: type = data.type

    let types = [
        {value: "empty", name: "Search All"},
        {value: "type", name: "Match Type"},
        {value: "eq", name: "Match Property"},
        {value: "and", name: "All Match"},
    ];

    function updateType() {
        if (type === data.type) {
            return
        }
        switch (type) {
            case "empty":
                data = emptySearcher();
                break
            case "type":
                data = {type: "type", value: undefined};
                break
            case "eq":
                data = {type: "eq", jsonPath: undefined, value: undefined};
                break
            case "and":
                data = {type: "and", searchers: []};
                break
        }
    }
</script>

<div class="flex items-end space-x-2">
    {#if data.type === "type"}
        <NodeTypeSearch {data}/>
    {:else if data.type === "eq"}
        <NodeEqSearch {data}/>
    {:else if data.type === "and"}
        <NodeMatchAllSearch {data}/>
    {/if}
    <Select bind:value={type} class="w-fit" items={types} on:change={updateType} size="sm"/>
</div>