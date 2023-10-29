<script lang="ts">
    import {Button, ButtonGroup, Input, Label} from "flowbite-svelte";
    import {randomElementId} from "../util";
    import type {GraphPropertyEditHandler} from "./property-edit";
    import {CheckSolid, CloseSolid} from "flowbite-svelte-icons";

    export let data: GraphPropertyEditHandler

    const id = randomElementId("property-edit")

    async function remove() {
        data = await data.remove()
    }

    async function save() {
        data = await data.save()
    }

    function reset() {
        data = data
    }
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
        <Input bind:value={data.value} disabled={!data.mutable} {id} on:change={reset}
               required={data.required}/>
        {#if data.dirty}
            <Button color="primary" on:click={save}>
                <CheckSolid size="sm"/>
            </Button>
        {/if}
        {#if data.origin}
            <Button color="primary" on:click={remove}>
                <CloseSolid size="sm"/>
            </Button>
        {/if}
    </ButtonGroup>
</div>
