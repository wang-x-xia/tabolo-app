import type {Readable} from "svelte/store";
import {readable} from "svelte/store";
import {getGraphMeta} from "../data/graph";
import type {Extendable} from "tabolo-core";

export type NodeCellConfig = ShowType | ShowJsonPath

export interface ShowType extends Extendable {
    type: "ShowType"
}

export interface ShowJsonPath extends Extendable {
    type: "ShowJsonPath"
    jsonPath: string
}

export function nodeCellConfig(type: string): Readable<NodeCellConfig> {
    let graphMeta = getGraphMeta();
    let defaultValue: ShowType = {type: "ShowType", provider: "default"}
    return readable<NodeCellConfig>(defaultValue, (set) => {
            async function _() {
                const meta = await graphMeta.getNodeMeta(type)
                if (meta.showJsonPath) {
                    set({
                        provider: "Node Meta",
                        type: "ShowJsonPath",
                        jsonPath: meta.showJsonPath
                    })
                }
            }

            _()
        }
    )
}