<script lang="ts">
    import type {Driver} from "neo4j-driver";
    import {fromDriver} from "./data";
    import {setCypher, setGraph, setGraphMeta} from "../data/graph";
    import {setGraphEdit} from "../edit/graph-edit";

    export let driver: Driver

    let value = fromDriver(driver)

    setGraph(value)
    setGraphMeta(value)
    setCypher(value)
    setGraphEdit(value)
</script>

<slot/>