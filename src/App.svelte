<script lang="ts">
    import {DefaultConfigLoader, setConfigLoader} from "./data/config";
    import PrepareLocal from "./json/PrepareLocal.svelte";
    import {Footer, FooterCopyright} from "flowbite-svelte";
    import NodeView from "./view/NodeView.svelte";
    import RelationshipView from "./view/RelationshipView.svelte";

    setConfigLoader(DefaultConfigLoader)
</script>

<main class="min-h-screen">
    <PrepareLocal>
        <NodeView/>
        <RelationshipView/>
    </PrepareLocal>
    <Footer class="absolute bottom-0 left-0 z-10 w-full">
        <FooterCopyright by="Tabolo" href="https://github.com/wang-x-xia/tabolo-app"/>
    </Footer>
</main>

