import type {Extendable} from "tabolo-core"

export type NodeCellConfig = ShowType | ShowJsonPath

export interface ShowType extends Extendable {
    type: "ShowType"
}

export interface ShowJsonPath extends Extendable {
    type: "ShowJsonPath"
    jsonPath: string
}
