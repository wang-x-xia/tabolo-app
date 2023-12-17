<script lang="ts">
    import type {TypeSearcher} from "tabolo-core/lib/searcher";
    import TypeSelect from "../edit/TypeSelect.svelte";

    export let data: TypeSearcher

</script>

<TypeSelect bind:type={data.value} source="Node"/>