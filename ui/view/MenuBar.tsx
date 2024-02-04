import {type PropsWithChildren, ReactElement, type ReactNode, useContext, useMemo, useState} from "react";
import {createPortal} from "react-dom";
import {GraphContext} from "../data/graph.ts";
import {GraphEditContext} from "../edit/graph-edit.ts";
import {useAsyncOrDefault} from "../utils/hooks.ts";
import {createMenuFromGraph, MenuContext, type MenuItem, type MenuRender, MenuRenderContext} from "./menu";

export function SetupMenuBar({children}: PropsWithChildren) {
    const graph = useContext(GraphContext)
    const graphEdit = useContext(GraphEditContext)
    const [refMap, setRefMap] = useState<Record<string, Element>>({})

    const menu = useMemo(() => createMenuFromGraph(graph, graphEdit), [graph, graphEdit])

    const allItems = useAsyncOrDefault(null, async () => {
        const items = await menu.listMenuItems()
        const result: Record<string, MenuItem> = {}
        items.forEach(it => result[it.name] = it)
        return result
    }, [menu])

    const [items, setItems] = useState<MenuItem[]>([])

    function setRef(item: MenuItem, dom: HTMLElement) {
        if (refMap[item.name] === dom) {
            return
        }
        setRefMap({
            ...refMap,
            [item.name]: dom
        })
    }

    const menuRender = useMemo<MenuRender>(() => ({
        item(menuItem: string, component: ReactNode): ReactElement {
            const dom = refMap[menuItem]
            if (dom) {
                return createPortal(component, dom)
            } else {
                if (items.every(it => it.name !== menuItem) && allItems != null) {
                    const item = allItems[menuItem] || {name: menuItem}
                    setItems([...items, item])
                }
                return <></>
            }
        }
    }), [items, refMap, allItems])

    return <>
        <header className="sticky top-0 z-10 flex p-2 space-x-2">
            {items.map(item =>
                <span key={item.name} id={item.name} ref={dom => dom && setRef(item, dom)}/>)}
        </header>
        <MenuContext.Provider value={menu}>
            <MenuRenderContext.Provider value={menuRender}>
                {children}
            </MenuRenderContext.Provider>
        </MenuContext.Provider>
    </>
}