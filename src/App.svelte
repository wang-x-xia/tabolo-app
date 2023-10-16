<script lang="ts">
    import View from "./view/View.svelte";
    import {DefaultConfigLoader, setConfigLoader} from "./data/config";
    import PrepareLocal from "./json/PrepareLocal.svelte";

    setConfigLoader(DefaultConfigLoader)
</script>

<main>
    <PrepareLocal>
        <View/>
    </PrepareLocal>
    <footer class="footer p-10 bg-neutral text-neutral-content">
        <div>
            Tabolo APP
            <a href="https://github.com/wang-x-xia/tabolo-app">
                Github
            </a>
        </div>
    </footer>
</main>

