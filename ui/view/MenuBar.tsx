import React, {type PropsWithChildren, useMemo, useState} from "react";
import {createPortal} from "react-dom";
import {useAsyncOrDefault, useGraph, useGraphEdit} from "../utils/hooks";
import {debugRandomString, randomString} from "../utils/id.ts";
import {
    createMenuFromGraph,
    emptyMenuItemRender,
    MenuContext,
    type MenuItem,
    type MenuItemRender,
    type MenuRender,
    MenuRenderContext
} from "./menu";

/**
 * Use the structure to maintain
 */
interface RefData {
    update: (value: string) => void,
    item: MenuItem,

    dom?: Element,
}

const debug = false

export function SetupMenuBar({children}: PropsWithChildren) {
    const graph = useGraph()
    const graphEdit = useGraphEdit()

    const menu = useMemo(() => createMenuFromGraph(graph, graphEdit), [graph, graphEdit])

    const allItems = useAsyncOrDefault(null, async () => {
        const items = await menu.listMenuItems()
        const result: Record<string, MenuItem> = {}
        items.forEach(it => result[it.name] = it)
        return result
    }, [menu])

    const [refs, setRefs] = useState<RefData[]>([])

    const menuRender = useMemo<MenuRender>(() => ({
        newMenuItem(name, update): MenuItemRender {
            if (allItems == null) {
                // Do nothing, and after the allItems changed, the context will trigger an update
                return emptyMenuItemRender()
            }

            const id = debugRandomString()
            const item: MenuItem = allItems[name] || {name: name}
            const ref: RefData = {item, update}

            if (debug) {
                console.log("New Menu Item", name, id, ref)
            }
            // When call this method, we wish to add a new items
            setRefs(refs => {
                if (import.meta.env.DEV) {
                    if (refs.some(v => v.item.name == name)) {
                        console.log("Duplicated Menu Items", name, ref, refs,)
                    }
                }
                if (refs.some(it => it === ref)) {
                    return refs
                }
                return [...refs, ref]
            })

            return {
                render(component: React.ReactNode): React.ReactElement {
                    if (ref.dom) {
                        return createPortal(component, ref.dom)
                    } else {
                        return <></>
                    }
                },
                close() {
                    setRefs(refs => {
                        if (debug) {
                            console.log("Remove the menu item", name, id, ref)
                        }
                        return refs.filter(it => it !== ref)
                    })
                }
            }
        },
    }), [allItems])

    function setRef(ref: RefData, dom: HTMLElement | null) {
        if (dom) {
            ref.dom = dom
            ref.update(randomString("Updated the Dom"))
            if (debug) {
                console.log("Update the ref", ref.item.name, ref, dom)
            }
        }
    }

    return <>
        <header className="sticky top-0 z-10 flex p-2 space-x-2">
            {refs.map(ref =>
                <span key={ref.item.name} id={ref.item.name} ref={dom => setRef(ref, dom)}/>)}
        </header>
        <MenuContext.Provider value={menu}>
            <MenuRenderContext.Provider value={menuRender}>
                {children}
            </MenuRenderContext.Provider>
        </MenuContext.Provider>
    </>
}