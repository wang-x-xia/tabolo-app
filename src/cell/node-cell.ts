import type {Readable} from "svelte/store";
import {readable} from "svelte/store";
import {getGraphMeta} from "../data/graph";
import type {Extendable} from "../data/base";

export type NodeCellConfig = ShowLabel | ShowProperties

export interface ShowLabel extends Extendable {
    type: "ShowLabel"
}

export interface ShowProperties extends Extendable {
    type: "ShowProperties"
    keys: string[]
}

export function nodeCellConfig(label: string): Readable<NodeCellConfig> {
    let graphMeta = getGraphMeta();
    let defaultValue: ShowLabel = {type: "ShowLabel", provider: "default"}
    return readable<NodeCellConfig>(defaultValue, (set) => {
            async function _() {
                const meta = await graphMeta.getLabel(label)
                const showPropertied = meta.properties.filter(v => v.show);
                if (showPropertied.length > 0) {
                    set({
                        provider: "Show Property",
                        type: "ShowProperties",
                        keys: showPropertied.sort((a, b) => a.show.localeCompare(b.show))
                            .map(it => it.key)
                    })
                }
            }

            _()
        }
    )
}