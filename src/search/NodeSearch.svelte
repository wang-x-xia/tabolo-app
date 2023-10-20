<script lang="ts">
    import type {NodeSearcher} from "../data/graph";
    import NullNodeSearch from "./NullNodeSearch.svelte";
    import NodeLabelSearch from "./NodeLabelSearch.svelte";
    import NodeEqSearch from "./NodeEqSearch.svelte";
    import NodeMatchAllSearch from "./NodeMatchAllSearch.svelte";
    import {Select} from "flowbite-svelte";

    export let data: NodeSearcher

    let type = data.type

    let types = [
        {value: "null", name: "Search All"},
        {value: "label", name: "Match Label"},
        {value: "eq", name: "Match Property"},
        {value: "and", name: "All Match"},
    ];

    function updateType() {
        if (type === data.type) {
            return
        }
        data.type = type
        switch (data.type) {
            case "null":
                data.value = {};
                break
            case "label":
                data.value = {label: undefined};
                break
            case "eq":
                data.value = {key: undefined, value: {value: undefined}};
                break
            case "and":
                data.value = {searchers: []};
                break
        }
    }
</script>

<div class="flex items-end space-x-2">
    {#if data.type === "null"}
        <NullNodeSearch data={data.value}/>
    {:else if data.type === "label"}
        <NodeLabelSearch data={data.value}/>
    {:else if data.type === "eq"}
        <NodeEqSearch data={data.value}/>
    {:else if data.type === "and"}
        <NodeMatchAllSearch data={data.value}/>
    {/if}
    <Select bind:value={type} class="w-fit" items={types} on:change={updateType} size="sm"/>
</div>