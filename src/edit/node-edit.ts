import type {Config} from "../data/config";
import type {Readable} from "svelte/store";
import {asyncReadable} from "../util";
import type {GraphMeta, GraphNode, GraphPropertyMeta} from "../data/graph";

export interface NodeEditConfig extends Config {
    labels: [string, PropertyMeta[]][],
}

export function nodeEditConfig(labels: string[], meta: GraphMeta): Readable<NodeEditConfig> {
    return asyncReadable<NodeEditConfig>({
            provider: "default",
            labels: labels.map(l => [l, []])
        },
        async function () {
            const labelMetas = await Promise.all(labels.map(it => meta.getLabel(it)))
            const sharedLabels = new Map<string, Set<string>>()
            labelMetas.forEach(labelMeta => {
                labelMeta.properties.forEach(p => {
                    if (!sharedLabels.has(p.key)) {
                        sharedLabels.set(p.key, new Set())
                    }
                    sharedLabels.get(p.key).add(labelMeta.label)
                })
            })
            const results = labelMetas.map<[string, PropertyMeta[]]>(labelMeta => {
                return [
                    labelMeta.label,
                    labelMeta.properties.map<PropertyMeta>(p => ({
                        sharedLabels: Array.from(sharedLabels.get(p.key)).filter(it => it !== labelMeta.label),
                        ...p
                    }))]
            })
            return {
                provider: "graph meta",
                labels: results
            }
        })
}


export function remainsProperties(configValue: NodeEditConfig, draft: GraphNode) {
    const keys = new Set(Object.keys(draft.properties));
    configValue.labels.forEach(([_, value]) => {
        value.forEach(p => {
            keys.delete(p.key)
        })
    })
    let remains = Array.from(keys)
    remains.sort()
    return remains
}

export interface PropertyMeta extends GraphPropertyMeta {
    sharedLabels: string[]
}