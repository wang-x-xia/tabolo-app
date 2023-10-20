<script lang="ts">
    import type {MatchAllSearcher, NodeSearcher} from "../data/graph";
    import {Button, Listgroup, ListgroupItem} from "flowbite-svelte";
    import NodeSearch from "./NodeSearch.svelte";
    import {CloseSolid, PlusSolid} from "flowbite-svelte-icons";

    export let data: MatchAllSearcher

    function remove(searcher: NodeSearcher) {
        data.searchers = data.searchers.filter(it => it !== searcher);
    }

    function addNew() {
        data.searchers = [...data.searchers, {type: "null", value: {}}]
    }
</script>

<Listgroup>
    {#each data.searchers as s}
        <ListgroupItem class="flex items-end space-x-2">
            <Button pill on:click={() => remove(s)} size="sm">
                <CloseSolid/>
            </Button>
            <NodeSearch bind:data={s}/>
        </ListgroupItem>
    {/each}
    <ListgroupItem>
        <Button on:click={addNew} pill size="sm">
            <PlusSolid/>
        </Button>
    </ListgroupItem>
</Listgroup>
