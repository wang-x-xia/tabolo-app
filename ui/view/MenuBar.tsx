import {
    type Dispatch,
    type PropsWithChildren,
    type ReactElement,
    type ReactNode,
    type SetStateAction,
    useMemo,
    useState
} from "react";
import {createPortal} from "react-dom";
import {useAsyncOrDefault, useGraph, useGraphEdit} from "../utils/hooks";
import {createMenuFromGraph, MenuContext, type MenuItem, type MenuRender, MenuRenderContext} from "./menu";

/**
 * Use the structure to maintain
 */
interface RefData {
    update: Dispatch<SetStateAction<ReactElement>>,
    component: ReactNode,
    item: MenuItem,

    dom?: Element,
}

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
        render(name, update, component): () => void {
            if (allItems == null) {
                // Do nothing, and after the allItems changed, the context will trigger an update
                return () => {
                }
            }
            // When call this method, we wish to add a new items
            setRefs(refs => {
                if (import.meta.env.DEV) {
                    if (refs.some(v => v.item.name == name)) {
                        console.log("Duplicated Menu Items", refs)
                    }
                }
                const item: MenuItem = allItems[name] || {name: name}
                return [...refs, {item, component, update}]
            })

            function remove() {
                setRefs(refs => {
                    return refs.filter(it => it.component === component)
                })
            }

            return remove
        },
    }), [allItems])

    function setRef(ref: RefData, dom: HTMLElement | null) {
        if (dom) {
            ref.dom = dom
            ref.update(createPortal(ref.component, dom))
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