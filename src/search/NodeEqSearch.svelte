<script lang="ts">
    import type {PropertySearcher} from "../data/graph";
    import {ButtonGroup, Input, InputAddon} from "flowbite-svelte";

    export let data: PropertySearcher

</script>

<ButtonGroup size="sm">
    <Input bind:value={data.key} placeholder="key"/>
    <InputAddon>=</InputAddon>
    <Input bind:value={data.value.value} placeholder="value"/>
</ButtonGroup>