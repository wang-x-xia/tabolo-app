import {Button, Dropdown} from "flowbite-react"
import {useCallback, useContext, useEffect, useMemo, useState} from "react"
import {emptySearcher, typeSearcher} from "../../core"
import {GraphContext} from "../data/graph"
import {GraphEditContext} from "../edit/graph-edit"
import {useAsyncOrDefault} from "../utils/hooks"
import {useMenuItem} from "./menu.tsx";
import {NodeEditView} from "./NodeEditView"
import {NodeView} from "./NodeView"
import {RelationshipEditView} from "./RelationshipEditView"
import {fromGraph, type SavedViewData, ViewData, ViewHandlerContext} from "./view"

export function View() {
    const graph = useContext(GraphContext)
    const graphEdit = useContext(GraphEditContext)
    const viewHandler = useMemo(() => fromGraph(graph, graphEdit), [graph, graphEdit]);

    const [viewData, setViewData] = useState<ViewData>({
        type: "NodeView",
        searcher: emptySearcher(),
        columns: [],
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
    const graph = useContext(GraphContext)
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
    const graphEdit = useContext(GraphEditContext)
    const viewHandler = useContext(ViewHandlerContext)

    async function saveView() {
        const node = await graphEdit.newEmptyNode()
        const savedViewData: SavedViewData = {
            name: "New View",
            data,
        }
        await graphEdit.editNodeProperty(node.id, savedViewData)
        await graphEdit.editNodeType(node.id, "SavedView")
        await viewHandler.updateView({type: "NodeEditView", nodeId: node.id})
    }

    return <Button onClick={saveView}>Save View</Button>
}

export function DispatchView({data}: {
    data: ViewData
}) {
    switch (data.type) {
        case "NodeView":
            return <NodeView data={data}/>
        case "NodeEditView":
            return <NodeEditView data={data}/>
        case "RelationshipEditView":
            return <RelationshipEditView data={data}/>

    }
}