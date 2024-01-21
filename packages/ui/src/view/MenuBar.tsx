import {type PropsWithChildren, useContext, useMemo, useState} from "react";
import {GraphContext} from "../data/graph.ts";
import {GraphEditContext} from "../edit/graph-edit.ts";
import {useAsyncOrDefault} from "../utils/hooks.ts";
import {createMenuFromGraph, MenuContext, type MenuItem, MenuRenderContext} from "./menu";

export function SetupMenuBar({children}: PropsWithChildren) {
    const graph = useContext(GraphContext)
    const graphEdit = useContext(GraphEditContext)
    const [menuRender, setMenuRender] = useState<Record<string, Element>>({})

    const menu = useMemo(() => createMenuFromGraph(graph, graphEdit), [graph, graphEdit])

    const items = useAsyncOrDefault([], async () => {
        return await menu.listMenuItems()
    }, [menu])

    function setRef(item: MenuItem, dom: HTMLElement) {
        if (menuRender[item.name] === dom) {
            return
        }
        setMenuRender({
            ...menuRender,
            [item.name]: dom
        })
    }

    return <>
        <header className="sticky top-0 z-10">
            {items.map(item =>
                <span key={item.name} ref={dom => dom && setRef(item, dom)}/>)}
        </header>
        <MenuContext.Provider value={menu}>
            <MenuRenderContext.Provider value={menuRender}>
                {children}
            </MenuRenderContext.Provider>
        </MenuContext.Provider>
    </>
}