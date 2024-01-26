import {Select} from "antd";
import {useContext} from "react";
import {GraphMetaContext} from "../data/graph";
import {useAsyncOrDefault} from "../utils/hooks.ts";

export function TypeSelect({type, source, onChange}: {
    type: string,
    source: "Node" | "Relationship"
    onChange(type: string): void
}) {
    const graphMeta = useContext(GraphMetaContext)

    const types = useAsyncOrDefault([], async () => {
        if (source === "Node") {
            return await graphMeta.getNodeTypes()
        } else {
            return await graphMeta.getRelationshipTypes()
        }
    }, [graphMeta, source])

    return <Select
        showSearch
        value={type}
        placeholder={`Select a ${source} type`}
        onChange={v => onChange(v)}
        options={types.map((t) => ({value: t, label: t,}))}
    />
}