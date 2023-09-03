import type {Readable} from "svelte/store";
import {readable} from "svelte/store";
import type {Config} from "../data/config";
import {getConfigLoader} from "../data/config";
import type {Cypher} from "../data/graph";
import {getCypher} from "../data/graph";

export type NodeCellConfig = ShowLabel | ShowOneField

export interface ShowLabel extends Config {
    type: "ShowLabel"
}

export interface ShowOneField extends Config {
    type: "ShowOneField"
    key: string
}

const cache = new Map<Cypher, Map<string, Promise<NodeCellConfig | undefined>>>()

export function nodeCellConfig(label: string): Readable<NodeCellConfig> {
    let configLoader = getConfigLoader();
    let cypher = getCypher();
    let defaultValue: ShowLabel = {type: "ShowLabel", provider: "default"}
    return readable<NodeCellConfig>(defaultValue, (set) => {
            async function _() {
                // from config
                const config = await configLoader.loadConfig<NodeCellConfig>(`NodeCellConfig_${label}`)
                if (config !== undefined) {
                    set(config);
                    return
                }

                // form constraint
                if (!cache.has(cypher)) {
                    cache.set(cypher, new Map())
                }
                let dsCache = cache.get(cypher)
                if (!dsCache.has(label)) {
                    async function loadFromConstraint(): Promise<NodeCellConfig | undefined> {
                        const constraints = await cypher.query(
                            'SHOW CONSTRAINTS WHERE type = "UNIQUENESS" AND labelsOrTypes =[$label] AND entityType = "NODE" AND size(properties) = 1',
                            {label: label})
                        if (constraints.records.length == 1) {
                            return {
                                provider: "unique constraint",
                                type: "ShowOneField",
                                key: constraints.records[0].properties[0]
                            }
                        }
                        return undefined
                    }

                    dsCache.set(label, loadFromConstraint())
                }
                const cached = await dsCache.get(label)
                if (cached !== undefined) {
                    set(cached)
                    return
                }
            }

            _()
        }
    )
}