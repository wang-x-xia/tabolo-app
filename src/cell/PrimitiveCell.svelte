<script lang="ts">

    export let data: any
</script>

{#if (typeof data === "string")}
    {data}
{:else if (typeof data === "number" || typeof data === "bigint") }
    {data.toString()}
{:else}
    {JSON.stringify(data)}
{/if}
