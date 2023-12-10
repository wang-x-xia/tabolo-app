<script lang="ts">

    import {getTaboloUI, setTaboloUI, type ViewData} from "../data/ui";
    import NodeView from "./NodeView.svelte";
    import NodeEditView from "./NodeEditView.svelte";

    let taboloUI = getTaboloUI()

    let viewData: ViewData | undefined = undefined

    setTaboloUI({
        ...taboloUI,
        async updateView(view: ViewData): Promise<ViewData> {
            const r = await taboloUI.updateView(view)
            console.log("update view", r)
            viewData = r
            return r
        },
    })

    async function setup() {
        viewData = await taboloUI.getView()
    }

    setup()

</script>

{#if (viewData === undefined) }
    Loading
{:else if (viewData.type === "NodeView") }
    <NodeView nodeSearcher={viewData.searcher}/>
{:else if ((viewData.type === "NodeEditView"))}
    <NodeEditView data={viewData}></NodeEditView>
{/if}
