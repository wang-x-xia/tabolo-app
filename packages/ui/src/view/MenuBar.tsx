import {Layout} from "antd";
import {type PropsWithChildren, useContext, useMemo} from "react";
import {GraphContext} from "../data/graph.ts";
import {GraphEditContext} from "../edit/graph-edit.ts";
import {useAsyncOrDefault} from "../utils/hooks.ts";
import {createMenuFromGraph, MenuContext, type MenuItem} from "./menu.ts";

export function SetupMenuBar({children}: PropsWithChildren) {
    const graph = useContext(GraphContext)
    const graphEdit = useContext(GraphEditContext)

    const menu = useMemo(() => createMenuFromGraph(graph, graphEdit), [graph, graphEdit])

    const items = useAsyncOrDefault([], async () => {
        return await menu.listMenuItems()
    }, [menu])

    return <>
        <Layout.Header className="sticky top-0 z-10">
            {items.map(item => <MenuItem data={item}/>)}
        </Layout.Header>
        <MenuContext.Provider value={menu}>
            {children}
        </MenuContext.Provider>
    </>
}

function MenuItem({}: { data: MenuItem }) {
    return <>
    </>
}