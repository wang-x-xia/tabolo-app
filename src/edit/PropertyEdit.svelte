<script lang="ts">
    import {Input, Label} from "flowbite-svelte";
    import {randomElementId} from "../util";
    import type {GraphPropertyEditHandler} from "./property-edit";

    export let data: GraphPropertyEditHandler

    const id = randomElementId("property-edit")
</script>

<div>
    <div class=" flex justify-between items-baseline mb-2">
        <Label defaultClass="text-sm" for={id}>
            {data.key}
            {#if (data.required)}
                <span class="text-red-500">*</span>
            {/if}
        </Label>
    </div>
    <Input bind:value={data.value} disabled={!data.mutable} {id} required={data.required}/>
</div>
