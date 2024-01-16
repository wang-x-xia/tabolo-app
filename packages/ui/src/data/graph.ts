import {createContext} from "react";
import type {Graph, GraphMeta} from "tabolo-core"

export const GraphContext = createContext<Graph>(null as any)

export const GraphMetaContext = createContext<GraphMeta>(null as any)
