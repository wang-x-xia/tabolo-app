import {createContext} from "react";
import type {GraphEdit} from "../../core"

export const GraphEditContext = createContext<GraphEdit>(null as any)