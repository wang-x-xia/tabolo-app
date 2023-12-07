<script lang="ts">
    import {Button, Popover} from "flowbite-svelte";
    import {idSelector, randomElementId} from "../util";
    import type {GraphRelationship} from "../data/graph";

    export let data: GraphRelationship

    const id = randomElementId("relationship-cell")
</script>

<Button {id}>{data.type}</Button>
<Popover title="Properties" triggeredBy={idSelector(id)}>
    {JSON.stringify(data.properties, null, 2)}
</Popover>
