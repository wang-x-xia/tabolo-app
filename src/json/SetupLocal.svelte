<script lang="ts">
    import {setGraph, setGraphMeta} from "../data/graph";
    import {setGraphEdit} from "../edit/graph-edit";
    import {LocalJsonGraph} from "./local-json-graph";

    export let jsonDb: LocalJsonGraph;

    setGraph(jsonDb)
    setGraphMeta(jsonDb)
    setGraphEdit(jsonDb)
</script>

<slot/>
