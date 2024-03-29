import {Button, Textarea, TextInput} from "flowbite-react";
import {useEffect, useState} from "react";
import {displayGraphId, type GraphNode, type GraphRelationship} from "../../core";
import {NodeIdCell} from "../cell/NodeCell.tsx";
import {RelationshipCell} from "../cell/RelationshipCell.tsx";
import {useGraphEdit, useViewHandler} from "../utils/hooks";
import {useMenuItem} from "../view/menu.tsx";
import {relationshipDetailView} from "../view/view.ts";
import {NodeSelect} from "./NodeSelect.tsx";
import {TypeSelect} from "./TypeSelect.tsx";

export function RelationshipDetail({data}: {
    data: GraphRelationship
}) {
    const graphEdit = useGraphEdit()
    const viewHandler = useViewHandler()

    const [local, setLocal] = useState(data)
    const [property, setProperty] = useState("")

    useEffect(() => {
        setProperty(JSON.stringify(data.properties))
        setLocal(data)
    }, [data])


    async function setType(type: string) {
        setLocal(await graphEdit.editRelationship(local.id, {type}))
    }

    async function remove() {
        await graphEdit.removeRelationship(local.id)
        history.back()
    }

    const deleteItem = useMenuItem("Delete Relationship", <Button onClick={remove}>Delete</Button>);

    async function copy() {
        const relationship = await graphEdit.createRelationship({
            type: data.type,
            properties: data.properties,
            startNodeId: data.startNodeId,
            endNodeId: data.endNodeId,
        });
        await viewHandler.updateView(relationshipDetailView(relationship.id))
    }

    const copyItem = useMenuItem("Copy Relationship", <Button onClick={copy}>Copy</Button>);

    async function save() {
        setLocal(await graphEdit.editRelationship(data.id, {properties: JSON.parse(property)}))
    }

    const savePropertyItem = useMenuItem("Save Relationship Property", <Button onClick={save}>Save</Button>);

    function reset() {
        setProperty(JSON.stringify(local.properties))
    }

    const resetPropertyItem = useMenuItem("Reset Relationship Property", <Button onClick={reset}>Reset</Button>);

    async function changeStartNode(node: GraphNode) {
        setLocal(await graphEdit.editRelationship(local.id, {startNodeId: node.id}))
    }

    async function changeEndNode(node: GraphNode) {
        setLocal(await graphEdit.editRelationship(local.id, {endNodeId: node.id}))
    }

    return <>
        {deleteItem}
        {copyItem}
        {savePropertyItem}
        {resetPropertyItem}
        <div className="flex space-x-2">
            <div className="flex flex-col items-center p-4 min-w-64 space-y-2">
                <label className="text-lg self-start">Start Node</label>
                <div className="flex flex-col items-center w-full p-6 bg-gray-50">
                    <NodeIdCell data={local.startNodeId}/>
                </div>
                <label className="text-lg self-start">Overview</label>
                <div className="flex flex-col items-center w-full p-6 bg-gray-100">
                    <RelationshipCell data={local}/>
                </div>
                <label className="text-lg self-start">End Node</label>
                <div className="flex flex-col items-center w-full p-6 bg-gray-50">
                    <NodeIdCell data={local.endNodeId}/>
                </div>
            </div>
            <div className="flex flex-col grow p-4 space-y-4">
                <label className="text-lg">Relationship ID</label>
                <TextInput className="max-w-96" disabled value={displayGraphId(local.id)}/>
                <label className="text-lg">Type</label>
                <div className="max-w-48">
                    <TypeSelect type={local.type} source="Relationship" onChange={setType}/>
                </div>
                <label className="text-lg">Change Nodes</label>
                <div className="flex space-x-2">
                    <NodeSelect label="Select Start Node" selectedId={local.startNodeId} onSelect={changeStartNode}/>
                    <NodeSelect label="Select End Node" selectedId={local.endNodeId} onSelect={changeEndNode}/>
                </div>
                <label className="text-lg">Property</label>
                <Textarea rows={property.split("\n").length}
                          value={property}
                          onChange={e => setProperty(e.target.value)}/>
            </div>
        </div>
    </>
}