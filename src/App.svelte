<script lang="ts">
    import ConnectNeo4j from "./neo4j/ConnectNeo4j.svelte";
    import View from "./view/View.svelte";
    import type {Driver} from "neo4j-driver";
    import type {ComponentEvents} from "svelte";
    import {DefaultConfigLoader, setConfigLoader} from "./data/config";
    import PrepareNeo4jData from "./neo4j/PrepareNeo4jData.svelte";

    let driver: Driver = null

    function connect(d: ComponentEvents<ConnectNeo4j>["connect"]) {
        driver = d.detail
    }

    setConfigLoader(DefaultConfigLoader)
</script>

<main>
    {#if driver === null}
        <ConnectNeo4j on:connect={connect}/>
    {:else }
        <PrepareNeo4jData {driver}>
            <View/>
        </PrepareNeo4jData>
    {/if}
    <footer class="footer p-10 bg-neutral text-neutral-content">
        <div>
            Tabolo APP
            <a href="https://github.com/wang-x-xia/tabolo-app">
                Github
            </a>
        </div>
    </footer>
</main>

