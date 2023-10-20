<script lang="ts">
    import {setGraph, setGraphMeta} from "../data/graph";
    import {setGraphEdit} from "../edit/graph-edit";
    import {LocalJsonGraph} from "./local-json-graph";
    import {Button, Label, Listgroup, ListgroupItem, Modal, SpeedDial, Textarea} from "flowbite-svelte";

    export let jsonDb: LocalJsonGraph;

    setGraph(jsonDb)
    setGraphMeta(jsonDb)
    setGraphEdit(jsonDb)

    async function exportAll() {
        const result = await jsonDb.exportAll();
        const url = URL.createObjectURL(new File([JSON.stringify(result, null, 2)], "data.json", {type: "application/json"}));
        window.open(url, "_blank");
    }

    let importAllModal = false
    let importAllValue = ""

    async function importAll() {
        await jsonDb.importAll(JSON.parse(importAllValue));
        importAllValue = "";
        importAllModal = false;
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