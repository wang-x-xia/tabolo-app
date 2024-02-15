import {Dropdown} from "flowbite-react";
import type {GraphRelationship} from "../../core"
import {useViewHandler} from "../utils/hooks";
import {relationshipDetailView} from "../view/view.ts";

export function RelationshipCell({data}: {
    data: GraphRelationship
}) {
    const viewHandler = useViewHandler()

    async function goToRelationship() {
        await viewHandler.updateView(relationshipDetailView(data.id))
    }

    return <div className="flex flex-col items-center
        rounded-lg border border-gray-200 bg-white shadow-md
        dark:border-gray-700 dark:bg-gray-800
        w-fit max-w-64 p-2 gap-1">
        <div className="self-end">
            <Dropdown inline label="">
                <Dropdown.Item>
                    <a onClick={goToRelationship}>Details</a>
                </Dropdown.Item>
            </Dropdown>
        </div>
        <h5 className="font-bold text-xs">{`[${data.type}]`}</h5>
    </div>
}