import {
    createContext,
    type Dispatch,
    type ReactElement,
    type ReactNode,
    type SetStateAction,
    useContext,
    useEffect,
    useState
} from "react";
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
    render(name: string, update: Dispatch<SetStateAction<ReactElement>>, component: ReactNode): () => void
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
    // create a hook if the r is ready
    const [element, setElement] = useState(<></>)
    useEffect(() => {
        return menuRender.render(name, setElement, component)
    }, [component])
    return element
}