import {Button, Input, Space} from "antd";
import {useContext, useEffect, useState} from "react";
import {GraphNode, relationshipNodeSearcher} from "tabolo-core";
import {NodeIdCell} from "../cell/NodeCell.tsx";
import {RelationshipCell} from "../cell/RelationshipCell.tsx";
import {GraphContext} from "../data/graph";
import {useAsyncOrDefault} from "../utils/hooks.ts";
import {ViewHandlerContext} from "../view/view.ts";
import {GraphEditContext} from "./graph-edit.ts";
import {TypeSelect} from "./TypeSelect.tsx";

export function NodeEdit({data}: {
    data: GraphNode
}) {
    const graph = useContext(GraphContext)
    const graphEdit = useContext(GraphEditContext)
    const viewHandler = useContext(ViewHandlerContext)

    const [update, forceUpdate] = useState(0)
    const [local, setLocal] = useState(data)
    const [property, setProperty] = useState("")

    useEffect(() => {
        setProperty(JSON.stringify(data.properties))
        setLocal(data)
    }, [data])


    async function setType(type: string) {
        setLocal(await graphEdit.editNodeType(local.id, type))
    }

    async function remove() {
        await graphEdit.removeNode(local.id)
        history.back()
    }


    async function copy() {
        const node = await graphEdit.copyNode(data.id);
        await viewHandler.updateView({
            "type": "NodeEditView",
            "nodeId": node.id
        });
    }

    async function save() {
        setLocal(await graphEdit.editNodeProperty(data.id, JSON.parse(property)))
    }


    function reset() {
        setProperty(JSON.stringify(local.properties))
    }


    const relationships = useAsyncOrDefault([], async () => {
        return await graph.searchRelationships(relationshipNodeSearcher(data.id))
    }, [graph, local, update])


    async function createRelationship() {
        await graphEdit.newEmptyRelationship(data.id, data.id)
        forceUpdate(update + 1)
    }

    const relationshipsDom = relationships.length === 0 ?
        <div>No Relationship</div>
        : <>
            <div>Relationships</div>
            {
                relationships.map(relationship => {
                    const start = relationship.startNodeId === local.id ? <>Self</> :
                        <NodeIdCell data={relationship.startNodeId}/>
                    const end = relationship.endNodeId === local.id ? <>Self</> :
                        <NodeIdCell data={relationship.endNodeId}/>
                    return <>
                        {start}
                        <RelationshipCell data={relationship}/>
                        {end}
                    </>
                })
            }
        </>

    return <>
        <div>Node ID</div>
        <Input disabled value={local.id}/>
        <div>Action</div>
        <Space.Compact block>
            <Button onClick={copy}>Copy</Button>
            <Button onClick={remove}>Delete</Button>
        </Space.Compact>
        <div>Type</div>
        <TypeSelect type={local.type} source="Node" onChange={setType}/>
        <div>Property</div>
        <Input.TextArea rows={20} onChange={e => setProperty(e.target.value)}/>
        <Space.Compact block>
            <Button onClick={save}>Save</Button>
            <Button onClick={reset}>Reset</Button>
        </Space.Compact>
        {relationshipsDom}
        <Button onClick={createRelationship}>New Relationship</Button>
    </>
}