import {getContext} from "svelte";

export interface ConfigLoader {
    loadConfig<T extends Config>(id: string): Promise<T | undefined>
}

export interface Config {
    provider: string
}

export const ConfigLoaderKey = "ConfigLoader"

export function getConfigLoader(): ConfigLoader {
    return getContext(ConfigLoaderKey)
}

class ConfigLoaderImpl implements ConfigLoader {

    cache: Record<string, any> = {}

    async loadConfig<T extends Config>(id: string): Promise<T | undefined> {
        return this.cache[id] as (T | undefined)
    }
}

export const DefaultConfigLoader: ConfigLoader = new ConfigLoaderImpl()