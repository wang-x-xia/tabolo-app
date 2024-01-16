import {MoreOutlined} from "@ant-design/icons"
import {Button, Popover, Space} from "antd"
import {useContext} from "react"
import type {GraphRelationship} from "tabolo-core"
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

    return <Popover title={`${data.type} Properties`} content={JSON.stringify(data.properties, null, 2)}>
        <Space.Compact block>
            <Button>{`<${data.type}>`}</Button>
            <Button icon={<MoreOutlined/>} onClick={editRelationship}/>
        </Space.Compact>
    </Popover>
}