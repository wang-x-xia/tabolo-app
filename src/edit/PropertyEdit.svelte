<script lang="ts">
    import {Button, ButtonGroup, Input, Label} from "flowbite-svelte";
    import {randomElementId} from "../util";
    import type {GraphPropertyEditHandler} from "./property-edit";
    import {CloseSolid} from "flowbite-svelte-icons";

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
    <ButtonGroup class="w-full">
        <Input bind:value={data.value} disabled={!data.mutable} {id} required={data.required}/>
        <Button color="primary" on:click={() => (data.value = null)}>
            <CloseSolid size="sm"/>
        </Button>
    </ButtonGroup>
</div>
