<script lang="ts">
    import {Button, ButtonGroup, Popover} from "flowbite-svelte";
    import {idSelector, randomElementId} from "../util";
    import type {GraphRelationship} from "tabolo-core";
    import {DotsHorizontalOutline} from "flowbite-svelte-icons";
    import {getViewHandler} from "../view/view";

    export let data: GraphRelationship

    const viewHandler = getViewHandler()

    async function editRelationship() {
        await viewHandler.updateView({
            "type": "RelationshipEditView",
            "relationshipId": data.id,
        })
    }

    const id = randomElementId("relationship-cell")
</script>

<ButtonGroup size="sm">
    <Button {id}>{data.type}</Button>
    <Button on:click={editRelationship}>
        <DotsHorizontalOutline/>
    </Button>
</ButtonGroup>
<Popover title="Properties" triggeredBy={idSelector(id)}>
    {JSON.stringify(data.properties, null, 2)}
</Popover>
