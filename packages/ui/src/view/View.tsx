import {Dropdown} from "flowbite-react"
import {useCallback, useContext, useEffect, useMemo, useState} from "react"
import {emptySearcher, typeSearcher} from "tabolo-core"
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
        searcher: emptySearcher()
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

    const menuItem = useMenuItem("Select View", <SelectView onUpdateView={updateView}/>)

    if (viewData === undefined) {
        return <>Loading</>
    }

    return <>
        {menuItem}
        <ViewHandlerContext.Provider value={childViewHandler}>
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
            <Dropdown.Item onClick={() => onUpdateView(view.data)}>
                {view.name}
            </Dropdown.Item>
        )}
    </Dropdown>
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