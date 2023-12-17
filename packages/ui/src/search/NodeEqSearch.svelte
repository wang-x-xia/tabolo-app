<script lang="ts">
    import {ButtonGroup, Input, InputAddon} from "flowbite-svelte";
    import type {PropertySearcher} from "tabolo-core/lib/node-searcher";

    export let data: PropertySearcher

</script>

<ButtonGroup size="sm">
    <Input bind:value={data.jsonPath} placeholder="JsonPath"/>
    <InputAddon>=</InputAddon>
    <Input bind:value={data.value} placeholder="value"/>
</ButtonGroup>