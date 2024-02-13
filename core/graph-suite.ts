import type {Graph} from "./graph"
import type {GraphEdit} from "./graph-edit"
import type {GraphMeta} from "./graph-meta"


export interface GraphSuite {
    graph: Graph,
    edit: GraphEdit,
    meta: GraphMeta,
}
