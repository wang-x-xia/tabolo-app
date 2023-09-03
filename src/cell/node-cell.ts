import type {Readable} from "svelte/store";
import {readable} from "svelte/store";
import type {Config} from "../data/config";
import {getConfigLoader} from "../data/config";
import {getGraphMeta} from "../data/graph";

export type NodeCellConfig = ShowLabel | ShowOneField

export interface ShowLabel extends Config {
    type: "ShowLabel"
}

export interface ShowOneField extends Config {
    type: "ShowOneField"
    key: string
}

export function nodeCellConfig(label: string): Readable<NodeCellConfig> {
    let configLoader = getConfigLoader();
    let graphMeta = getGraphMeta();
    let defaultValue: ShowLabel = {type: "ShowLabel", provider: "default"}
    return readable<NodeCellConfig>(defaultValue, (set) => {
            async function _() {
                // from config
                const config = await configLoader.loadConfig<NodeCellConfig>(`NodeCellConfig_${label}`)
                if (config !== undefined) {
                    set(config);
                    return
                }

                const meta = await graphMeta.getLabel(label)
                const oneKeyUniqueConstraint = meta.uniqueConstraints.filter(it => it.length === 1)
                if (oneKeyUniqueConstraint.length == 1) {
                    set({
                        provider: "unique constraint",
                        type: "ShowOneField",
                        key: oneKeyUniqueConstraint[0][0]
                    })
                }
            }

            _()
        }
    )
}