<script lang="ts">
    import SetupNeo4j from "./neo4j/SetupNeo4j.svelte";
    import View from "./view/View.svelte";
    import type {Driver} from "neo4j-driver";
    import type {ComponentEvents} from "svelte";

    let driver: Driver = null

    function connect(d: ComponentEvents<SetupNeo4j>["connect"]) {
        driver = d.detail
    }
</script>

<main>
    {#if driver === null}
        <SetupNeo4j on:connect={connect}></SetupNeo4j>
    {:else }
        <View {driver}></View>
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

