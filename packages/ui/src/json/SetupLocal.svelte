<script lang="ts">
    import type {Graph, GraphEdit, GraphMeta} from "tabolo-core";
    import {setGraph, setGraphMeta} from "../data/graph";
    import {setGraphEdit} from "../edit/graph-edit";
    import {Button, Label, Listgroup, ListgroupItem, Modal, SpeedDial, Textarea} from "flowbite-svelte";
    import type {LocalJson} from "./local-json-graph";

    export let jsonDb: [Graph, GraphEdit, GraphMeta, LocalJson];

    let [graph, graphEdit, graphMeta, localJson] = jsonDb

    setGraph(graph)
    setGraphEdit(graphEdit)
    setGraphMeta(graphMeta)

    async function exportAll() {
        const result = await localJson.exportAll();
        const url = URL.createObjectURL(new File([JSON.stringify(result, null, 2)], "data.json", {type: "application/json"}));
        window.open(url, "_blank");
    }

    let importAllModal = false
    let importAllValue = ""

    async function importAll() {
        await localJson.importAll(JSON.parse(importAllValue));
        importAllValue = "";
        importAllModal = false;
    }

    async function reset() {
        await localJson.importAll(await import("../assets/Tabolo.json"));
    }
</script>

<SpeedDial defaultClass="absolute right-6 bottom-6 z-20">
    <Listgroup active>
        <ListgroupItem on:click={exportAll}>
            ExportAll
        </ListgroupItem>
        <ListgroupItem on:click={() => importAllModal = true}>
            ImportAll
        </ListgroupItem>
        <ListgroupItem on:click={reset}>
            ResetData
        </ListgroupItem>
    </Listgroup>
</SpeedDial>
<slot/>
<Modal bind:open={importAllModal} title="Import All data">
    <form class="space-y-6" on:submit|preventDefault={importAll}>
        <div>
            <Label class="mb-2">New Key</Label>
            <Textarea bind:value={importAllValue}/>
        </div>
        <div class="space-x-4">
            <Button type="submit">Save</Button>
        </div>
    </form>
</Modal>