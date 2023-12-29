<script lang="ts">

    import {fromGraph, type SavedViewData, setViewHandler, type ViewData} from "./view";
    import NodeView from "./NodeView.svelte";
    import NodeEditView from "./NodeEditView.svelte";
    import {Button, Drawer, Listgroup, ListgroupItem} from "flowbite-svelte";
    import {randomElementId} from "../util";
    import {getGraph} from "../data/graph";
    import {getGraphEdit} from "../edit/graph-edit";
    import {typeSearcher} from "tabolo-core";
    import {onDestroy} from "svelte";
    import RelationshipEditView from "./RelationshipEditView.svelte";

    const graph = getGraph()
    const graphEdit = getGraphEdit()
    const viewHandler = fromGraph(graph, graphEdit);


    async function updateView(view: ViewData): Promise<ViewData> {
        history.pushState(viewData, "")
        const r = await viewHandler.updateView(view)
        viewData = r
        return r
    }

    setViewHandler({
        ...viewHandler,
        updateView,
    })

    let savedViews: SavedViewData[] = []

    let hiddenSelectView = true

    let viewData: ViewData | undefined = undefined

    async function setup() {
        const nodes = await graph.searchNodes(typeSearcher("SavedView"))
        viewData = await viewHandler.getView()
        savedViews = nodes.map(it => it.properties as SavedViewData).sort((l, r) => l.name.localeCompare(r.name))
    }

    async function popState(e: PopStateEvent) {
        if (e.state) {
            viewData = await viewHandler.updateView(e.state)
        }
    }

    window.addEventListener("popstate", popState)

    onDestroy(() => {
        window.removeEventListener("popstate", popState)
    })

    setup()

    const id = randomElementId()
</script>

<Button on:click={()=> hiddenSelectView = false}>Select View</Button>
{#if (viewData === undefined) }
    Loading
{:else if (viewData.type === "NodeView") }
    <NodeView nodeSearcher={viewData.searcher}/>
{:else if ((viewData.type === "NodeEditView"))}
    <NodeEditView data={viewData}/>
{:else if (viewData.type === "RelationshipEditView")}
    <RelationshipEditView data={viewData}/>
{/if}


<Drawer bind:hidden={hiddenSelectView} {id} transitionType="fly">
    <Listgroup>
        {#each savedViews as savedView }
            <ListgroupItem>
                <Button on:click={() => updateView(savedView.data)}>
                    {savedView.name}
                </Button>
            </ListgroupItem>
        {/each}
    </Listgroup>
</Drawer>