import {createContext, type ReactNode, useContext, useMemo} from "react";
import {createPortal} from "react-dom";
import {type Graph, type GraphEdit, typeSearcher} from "../../core";

export interface Menu {
    listMenuItems(): Promise<MenuItem[]>
}

export interface MenuItem {
    name: string
}


export interface MenuRender {
    [key: string]: Element
}


export const MenuContext = createContext<Menu>(null as any)

export const MenuRenderContext = createContext<MenuRender>(null as any)


// @ts-ignore
export function createMenuFromGraph(graph: Graph, graphEdit: GraphEdit): Menu {
    return {
        async listMenuItems(): Promise<MenuItem[]> {
            const nodes = await graph.searchNodes(typeSearcher("Menu Item"));
            return nodes.map(it => it.properties)
        },
    }
}

export function useMenuItem(name: string, component: ReactNode) {
    const menuRender = useContext(MenuRenderContext)
    const dom = useMemo(() => menuRender[name], [name, menuRender])

    if (dom) {
        return createPortal(component, dom)
    } else {
        return <></>
    }
}