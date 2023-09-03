<script lang="ts">
    import type {Driver} from "neo4j-driver";
    import {fromDriver} from "./data";
    import {setCypher, setGraph} from "../data/graph";

    export let driver: Driver

    let value = fromDriver(driver)

    setGraph(value)
    setCypher(value)
</script>

<slot/>