import {defineInContext} from "../util";
import type {Graph, GraphMeta} from "tabolo-core"

export const [getGraph, setGraph] = defineInContext<Graph>("Graph")
export const [getGraphMeta, setGraphMeta] = defineInContext<GraphMeta>("GraphMeta")
