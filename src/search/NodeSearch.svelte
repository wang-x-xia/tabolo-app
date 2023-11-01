<script lang="ts">
    import NullNodeSearch from "./NullNodeSearch.svelte";
    import NodeLabelSearch from "./NodeLabelSearch.svelte";
    import NodeEqSearch from "./NodeEqSearch.svelte";
    import NodeMatchAllSearch from "./NodeMatchAllSearch.svelte";
    import {Select} from "flowbite-svelte";
    import type {NodeSearcher} from "../data/node-searcher";
    import {emptySearcher} from "../data/searcher";

    export let data: NodeSearcher

    let type = data.type

    let types = [
        {value: "empty", name: "Search All"},
        {value: "label", name: "Match Label"},
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
            case "label":
                data = {type: "label", label: undefined};
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
    {:else if data.type === "label"}
        <NodeLabelSearch {data}/>
    {:else if data.type === "eq"}
        <NodeEqSearch {data}/>
    {:else if data.type === "and"}
        <NodeMatchAllSearch {data}/>
    {/if}
    <Select bind:value={type} class="w-fit" items={types} on:change={updateType} size="sm"/>
</div>