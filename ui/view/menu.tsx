import {createContext, type ReactElement, type ReactNode, useContext, useEffect, useState} from "react";
import {type Graph, type GraphEdit, typeSearcher} from "../../core";

export interface Menu {
    listMenuItems(): Promise<MenuItem[]>
}

export interface MenuItem {
    name: string
}

export interface MenuRender {
    /**
     * @return remove fn
     */
    newMenuItem(name: string, update: (value: string) => void): MenuItemRender
}

export interface MenuItemRender {
    close(): void

    render(component: ReactNode): ReactElement
}

export function emptyMenuItemRender(): MenuItemRender {
    return {
        render(_) {
            return <></>
        },
        close() {
        }
    }
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
    // Create the hook if the menu render is ready
    const [_, hook] = useState("")

    // Use state to control the lifecycle of useEffect
    const [render, setRender] = useState(emptyMenuItemRender())

    useEffect(() => {
        // Create render
        const render = menuRender.newMenuItem(name, hook)
        setRender(render)
        // Register remover
        return render.close
    }, [menuRender])

    return render.render(component)
}