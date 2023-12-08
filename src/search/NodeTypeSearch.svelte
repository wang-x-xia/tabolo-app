<script lang="ts">
    import type {TypeSearcher} from "../data/searcher";
    import NodeTypeSelect from "../edit/NodeTypeSelect.svelte";

    export let data: TypeSearcher

</script>

<NodeTypeSelect bind:type={data.value}/>