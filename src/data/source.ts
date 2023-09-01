import {Driver, EagerResult} from "neo4j-driver";
import {getContext} from "svelte";

export interface DataSource {
    query(query: string, parameters?: any): Promise<EagerResult>;
}

export const DataSourceKey = "DataSource"

export function getDataSource(): DataSource {
    return getContext(DataSourceKey)
}

export function fromDriver(driver: Driver): DataSource {
    return {
        query(query: string, parameters?: any): Promise<EagerResult> {
            return driver.executeQuery(query, parameters)
        }
    }
}