<script lang="ts">
    import View from "./view/View.svelte";
    import {DefaultConfigLoader, setConfigLoader} from "./data/config";
    import PrepareLocal from "./json/PrepareLocal.svelte";
    import {Footer, FooterCopyright} from "flowbite-svelte";

    setConfigLoader(DefaultConfigLoader)
</script>

<main class="min-h-screen">
    <PrepareLocal>
        <View/>
    </PrepareLocal>
    <Footer class="absolute bottom-0 left-0 z-10 w-full">
        <FooterCopyright href="https://github.com/wang-x-xia/tabolo-app" by="Tabolo"/>
    </Footer>
</main>

