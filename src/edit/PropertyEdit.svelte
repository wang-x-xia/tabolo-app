<script lang="ts">
    import type {PropertyMeta} from "./node-edit";
    import type {GraphType} from "../data/graph";
    import {getType} from "../data/graph";
    import {Input, Label, NumberInput, Select} from "flowbite-svelte";
    import {randomElementId} from "../util";

    export let key: string | null = null
    export let property: PropertyMeta | null = null
    export let value: any

    const id = randomElementId("property-edit")
    const _property = property
    if (_property !== null) {
        key = _property.key
    }

    let type: GraphType = "string"

    if (value === undefined) {
        value = null
        if (_property !== null && _property.types.length == 0) {
            type = _property.types[0]
        }
    } else {
        type = getType(value)
    }

    let types: { value: GraphType, name: string }[] = [
        {value: "string", name: 'String'},
        {value: "number", name: 'Number'},
    ];
</script>

<div>
    <div class=" flex justify-between items-baseline mb-2">
        <Label for={id} defaultClass="text-sm">{key}</Label>
        <Select size="sm" class="w-28" sr-only items={types} bind:value={type}/>
    </div>
    {#if (type === "string")}
        <Input {id} required={_property?.required} bind:value/>
    {:else if (type === "number")}
        <NumberInput {id} required={_property?.required} bind:value/>
    {/if}
</div>
