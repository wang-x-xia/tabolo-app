import {createContext} from "react";
import type {GraphEdit} from "tabolo-core"

export const GraphEditContext = createContext<GraphEdit>(null as any)