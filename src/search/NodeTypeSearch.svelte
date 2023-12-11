<script lang="ts">
    import type {TypeSearcher} from "../data/searcher";
    import TypeSelect from "../edit/TypeSelect.svelte";

    export let data: TypeSearcher

</script>

<TypeSelect source="Node" bind:type={data.value}/>