import {createContext} from "react";
import {type Graph, type GraphEdit, typeSearcher} from "tabolo-core";

export interface Menu {
    listMenuItems(): Promise<MenuItem[]>
}

export interface MenuItem {
    name: string
}


export const MenuContext = createContext<Menu>(null as any)


// @ts-ignore
export function createMenuFromGraph(graph: Graph, graphEdit: GraphEdit): Menu {
    return {
        async listMenuItems(): Promise<MenuItem[]> {
            const nodes = await graph.searchNodes(typeSearcher("MenuItem"));
            return nodes.map(it => it.properties)
        },
    }
}