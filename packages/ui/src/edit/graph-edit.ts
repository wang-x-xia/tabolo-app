import {defineInContext} from "../util";
import type {GraphEdit} from "tabolo-core"

export const [getGraphEdit, setGraphEdit] = defineInContext<GraphEdit>("GraphEdit")
