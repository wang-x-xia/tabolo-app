import {Button, Table, Textarea, TextInput} from "flowbite-react";
import {useContext, useEffect, useState} from "react";
import {GraphNode, relationshipNodeSearcher} from "../../core";
import {NodeCell, NodeIdCell} from "../cell/NodeCell.tsx";
import {RelationshipCell} from "../cell/RelationshipCell.tsx";
import {GraphContext} from "../data/graph";
import {TABLE_THEME} from "../utils/flowbite.ts";
import {useAsyncOrDefault} from "../utils/hooks.ts";
import {useMenuItem} from "../view/menu.tsx";
import {ViewHandlerContext} from "../view/view.ts";
import {GraphEditContext} from "./graph-edit.ts";
import {TypeSelect} from "./TypeSelect.tsx";

export function NodeEdit({data}: {
    data: GraphNode
}) {
    const graphEdit = useContext(GraphEditContext)
    const viewHandler = useContext(ViewHandlerContext)

    const [local, setLocal] = useState(data)
    const [property, setProperty] = useState("")

    useEffect(() => {
        setProperty(JSON.stringify(data.properties, null, 2))
        setLocal(data)
    }, [data])


    async function setType(type: string) {
        setLocal(await graphEdit.editNodeType(local.id, type))
    }

    async function remove() {
        await graphEdit.removeNode(local.id)
        history.back()
    }

    const deleteNodeItem = useMenuItem("Delete Node", <Button onClick={remove}>Delete</Button>);

    async function copy() {
        const node = await graphEdit.copyNode(data.id);
        await viewHandler.updateView({
            "type": "NodeEditView",
            "nodeId": node.id
        });
    }

    const copyMenuItem = useMenuItem("Copy Node", <Button onClick={copy}>Copy</Button>);

    async function save() {
        setLocal(await graphEdit.editNodeProperty(data.id, JSON.parse(property)))
    }

    const saveNodePropertyItem = useMenuItem("Save Node Property", <Button onClick={save}>Save</Button>);

    function reset() {
        setProperty(JSON.stringify(local.properties))
    }

    const resetNodePropertyItem = useMenuItem("Reset Node Property", <Button onClick={reset}>Reset</Button>);


    async function createRelationship() {
        await graphEdit.newEmptyRelationship(data.id, data.id)
    }

    const createRelationshipItem = useMenuItem("Create Relationship",
        <Button onClick={createRelationship}>New Relationship</Button>);

    return <>
        {copyMenuItem}
        {saveNodePropertyItem}
        {resetNodePropertyItem}
        {deleteNodeItem}
        {createRelationshipItem}
        <div className="flex space-x-2">
            <div className="flex flex-col items-center p-4 min-w-64 space-y-2">
                <label className="text-lg self-start">Overview</label>
                <div className="flex flex-col items-center w-full p-6 bg-gray-100">
                    <NodeCell data={local}/>
                </div>
            </div>
            <div className="flex flex-col grow p-4 space-y-4">
                <label className="text-lg">Node ID</label>
                <TextInput className="max-w-96" disabled value={local.id}/>
                <label className="text-lg">Type</label>
                <div className="max-w-48">
                    <TypeSelect type={local.type} source="Node" onChange={setType}/>
                </div>
                <label className="text-lg">Property</label>
                <Textarea rows={property.split("\n").length}
                          value={property}
                          onChange={e => setProperty(e.target.value)}/>
                <NodeRelationships data={data}/>
            </div>
        </div>
    </>
}


export function NodeRelationships({data}: {
    data: GraphNode,
}) {

    const graph = useContext(GraphContext)

    const relationships = useAsyncOrDefault([], async () => {
        return await graph.searchRelationships(relationshipNodeSearcher(data.id))
    }, [graph])

    if (relationships.length === 0) {
        return <label className="text-lg">No Relationship</label>
    }

    return <>
        <label className="text-lg">Relationships</label>
        <div className="min-w-64 max-w-fit">
            <Table theme={TABLE_THEME}>
                <Table.Head>
                    <Table.HeadCell>Start</Table.HeadCell>
                    <Table.HeadCell>Relationship</Table.HeadCell>
                    <Table.HeadCell>End</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                    {relationships.map(relationship => <Table.Row>
                        <Table.Cell>
                            {relationship.startNodeId === data.id ? <>Self</> :
                                <NodeIdCell data={relationship.startNodeId}/>}
                        </Table.Cell>
                        <Table.Cell>
                            <RelationshipCell data={relationship}/>
                        </Table.Cell>
                        <Table.Cell>
                            {relationship.endNodeId === data.id ? <>Self</> :
                                <NodeIdCell data={relationship.endNodeId}/>}
                        </Table.Cell>
                    </Table.Row>)}
                </Table.Body>
            </Table>
        </div>
    </>
}