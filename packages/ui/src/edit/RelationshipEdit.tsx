import {Button, Input, Space} from "antd";
import {useContext, useEffect, useState} from "react";
import {type GraphRelationship} from "tabolo-core";
import {NodeIdCell} from "../cell/NodeCell.tsx";
import {ViewHandlerContext} from "../view/view.ts";
import {GraphEditContext} from "./graph-edit.ts";
import {TypeSelect} from "./TypeSelect.tsx";

export function RelationshipEdit({data}: {
    data: GraphRelationship
}) {
    const graphEdit = useContext(GraphEditContext)
    const viewHandler = useContext(ViewHandlerContext)

    const [local, setLocal] = useState(data)
    const [property, setProperty] = useState("")

    useEffect(() => {
        setProperty(JSON.stringify(data.properties))
        setLocal(data)
    }, [data])


    async function setType(type: string) {
        setLocal(await graphEdit.editRelationshipType(local.id, type))
    }

    async function remove() {
        await graphEdit.removeRelationship(local.id)
        history.back()
    }


    async function copy() {
        const relationship = await graphEdit.copyRelationship(data.id);
        await viewHandler.updateView({
            "type": "RelationshipEditView",
            "relationshipId": relationship.id
        });
    }

    async function save() {
        setLocal(await graphEdit.editRelationshipProperty(data.id, JSON.parse(property)))
    }


    function reset() {
        setProperty(JSON.stringify(local.properties))
    }

    return <>
        <div>Relationship ID</div>
        <Input disabled value={local.id}/>
        <div>Action</div>
        <Space.Compact block>
            <Button onClick={copy}>Copy</Button>
            <Button onClick={remove}>Delete</Button>
        </Space.Compact>
        <div>Type</div>
        <TypeSelect type={local.type} source="Relationship" onChange={setType}/>
        <div>Start Node</div>
        <NodeIdCell data={data.startNodeId}/>
        <div>End Node</div>
        <NodeIdCell data={data.endNodeId}/>
        <div>Property</div>
        <Input.TextArea rows={20} value={property} onChange={e => setProperty(e.target.value)}/>
        <Space.Compact block>
            <Button onClick={save}>Save</Button>
            <Button onClick={reset}>Reset</Button>
        </Space.Compact>
    </>
}