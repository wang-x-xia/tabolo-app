import type {Readable} from "svelte/store";
import {readable} from "svelte/store";
import type {Config} from "../data/config";
import {getConfigLoader} from "../data/config";
import {getGraphMeta} from "../data/graph";

export type NodeCellConfig = ShowLabel | ShowProperties

export interface ShowLabel extends Config {
    type: "ShowLabel"
}

export interface ShowProperties extends Config {
    type: "ShowProperties"
    keys: string[]
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