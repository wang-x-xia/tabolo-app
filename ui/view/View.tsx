import {Button, Dropdown} from "flowbite-react"
import {useCallback, useEffect, useMemo, useState} from "react"
import {typeSearcher} from "../../core"
import {useAsyncOrDefault, useGraph, useGraphEdit, useViewHandler, ViewHandlerContext} from "../utils/hooks"
import {useMenuItem} from "./menu.tsx";
import {NodeDetailView} from "./NodeDetailView.tsx"
import {NodeView} from "./NodeView"
import {RelationshipDetailView} from "./RelationshipDetailView.tsx"
import {fromGraph, nodeDetailView, type SavedViewData, ViewData} from "./view"

export function View() {
    const graph = useGraph()
    const graphEdit = useGraphEdit()
    const viewHandler = useMemo(() => fromGraph(graph, graphEdit), [graph, graphEdit]);

    const [viewData, setViewData] = useState<ViewData>({
        type: "Loading",
    })

    useEffect(() => {
        viewHandler.getView().then(setViewData)

        async function popState(e: PopStateEvent) {
            if (e.state) {
                setViewData(await viewHandler.updateView(e.state))
            }
        }

        window.addEventListener("popstate", popState)
        return () => {
            window.removeEventListener("popstate", popState)
        }
    }, [])

    const updateView = useCallback(async (view: ViewData): Promise<ViewData> => {
        history.pushState(viewData, "")
        const r = await viewHandler.updateView(view)
        setViewData(r)
        return r
    }, [viewData, viewHandler])


    const childViewHandler = useMemo(() => {
        return {
            ...viewHandler,
            updateView,
        }
    }, [updateView, viewHandler])

    const selectViewMenuItem = useMenuItem("Select View", <SelectView onUpdateView={updateView}/>)
    const saveViewMenuItem = useMenuItem("Save View", <SaveView data={viewData}/>)

    if (viewData === undefined) {
        return <>Loading</>
    }

    return <>
        {selectViewMenuItem}
        <ViewHandlerContext.Provider value={childViewHandler}>
            {saveViewMenuItem}
            <DispatchView data={viewData}/>
        </ViewHandlerContext.Provider>
    </>
}

export function SelectView({onUpdateView}: {
    onUpdateView(view: ViewData): any
}) {
    const graph = useGraph()
    const savedViews = useAsyncOrDefault<SavedViewData[]>([], async () => {
        const nodes = await graph.searchNodes(typeSearcher("SavedView"))
        return nodes.map(it => it.properties as SavedViewData)
            .sort((l, r) => l.name.localeCompare(r.name))
    }, [graph])


    return <Dropdown label="Select View">
        {savedViews.map(view =>
            <Dropdown.Item key={view.name} onClick={() => onUpdateView(view.data)}>
                {view.name}
            </Dropdown.Item>
        )}
    </Dropdown>
}

export function SaveView({data}: { data: ViewData }) {
    const graphEdit = useGraphEdit()
    const viewHandler = useViewHandler()

    async function saveView() {
        const savedViewData: SavedViewData = {
            name: "New View",
            data,
        }
        const node = await graphEdit.createNode({
            type: "SavedView",
            properties: savedViewData
        })
        await viewHandler.updateView(nodeDetailView(node.id))
    }

    return <Button onClick={saveView}>Save View</Button>
}

export function DispatchView({data}: {
    data: ViewData
}) {
    switch (data.type) {
        case "NodeView":
            return <NodeView data={data}/>
        case "NodeDetailView":
            return <NodeDetailView data={data}/>
        case "RelationshipDetailView":
            return <RelationshipDetailView data={data}/>
        case "Loading":
            return <>Loading</>
    }
}