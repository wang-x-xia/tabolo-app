<script lang="ts">
    import {createJsonKv} from "./local-json-graph";
    import SetupLocal from "./SetupLocal.svelte";


    const asyncJsonDb = createJsonKv("Tabolo");

</script>

{#await asyncJsonDb }
    Loading db
{:then jsonDb}
    <SetupLocal {jsonDb}>
        <slot/>
    </SetupLocal>
{/await}