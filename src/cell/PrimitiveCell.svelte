<script lang="ts">
    import {isInt} from "neo4j-driver";

    export let data: any
</script>

{#if (typeof data === "string")}
    {data}
{:else if (isInt(data))}
    {data.toString()}
{:else}
    {JSON.stringify(data)}
{/if}
