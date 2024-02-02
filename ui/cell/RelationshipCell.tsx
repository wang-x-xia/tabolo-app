import {Dropdown} from "flowbite-react";
import {useContext} from "react"
import type {GraphRelationship} from "../../core"
import {ViewHandlerContext} from "../view/view"

export function RelationshipCell({data}: {
    data: GraphRelationship
}) {
    const viewHandler = useContext(ViewHandlerContext)

    async function editRelationship() {
        await viewHandler.updateView({
            "type": "RelationshipEditView",
            "relationshipId": data.id,
        })
    }

    return <div className="flex flex-col items-center
        rounded-lg border border-gray-200 bg-white shadow-md
        dark:border-gray-700 dark:bg-gray-800
        w-fit max-w-64 p-2 gap-1">
        <div className="self-end">
            <Dropdown inline label="">
                <Dropdown.Item>
                    <a onClick={editRelationship}>Edit</a>
                </Dropdown.Item>
            </Dropdown>
        </div>
        <h5 className="font-bold text-xs">{`[${data.type}]`}</h5>
    </div>
}