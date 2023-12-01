<script lang="ts">
    import NullNodeSearch from "./NullNodeSearch.svelte";
    import NodeTypeSearch from "./NodeTypeSearch.svelte";
    import NodeEqSearch from "./NodeEqSearch.svelte";
    import NodeMatchAllSearch from "./NodeMatchAllSearch.svelte";
    import {Select} from "flowbite-svelte";
    import type {NodeSearcher} from "../data/node-searcher";
    import {emptySearcher} from "../data/searcher";

    export let data: NodeSearcher

    let type = data.type

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
                data = {type: "eq", key: undefined, value: {value: undefined}};
                break
            case "and":
                data = {type: "and", searchers: []};
                break
        }
    }
</script>

<div class="flex items-end space-x-2">
    {#if data.type === "empty"}
        <NullNodeSearch {data}/>
    {:else if data.type === "type"}
        <NodeTypeSearch {data}/>
    {:else if data.type === "eq"}
        <NodeEqSearch {data}/>
    {:else if data.type === "and"}
        <NodeMatchAllSearch {data}/>
    {/if}
    <Select bind:value={type} class="w-fit" items={types} on:change={updateType} size="sm"/>
</div>