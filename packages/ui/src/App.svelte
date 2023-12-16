<script lang="ts">
    import PrepareLocal from "./json/PrepareLocal.svelte";
    import {Footer, FooterCopyright} from "flowbite-svelte";
    import View from "./view/View.svelte";
</script>

<main class="min-h-screen max-h-screen overflow-auto">
    <PrepareLocal>
        <View/>
    </PrepareLocal>
    <Footer class="absolute bottom-0 left-0 z-10 w-full">
        <FooterCopyright by="Tabolo" href="https://github.com/wang-x-xia/tabolo-app"/>
    </Footer>
</main>

