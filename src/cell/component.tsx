import {RowHeader} from "../view/type.ts";
import {isInt, isNode, isRelationship, Node, Relationship} from "neo4j-driver";
import {Badge, Popover, Table} from "antd";
import {ColumnsType} from "antd/es/table";

export function Cell({header, data}: { header: RowHeader, data: unknown }) {
    if (header.type == "auto") {
        if (isNode(data)) {
            return <NodeCell data={data}/>
        } else if (isRelationship(data)) {
            return <RelationshipCell data={data}/>
        } else {
            return <PrimitiveCell data={data}/>
        }
    }
}

export function PrimitiveCell({data}: { data: unknown }) {
    if (typeof data === "string") {
        return <>{data}</>
    } else if (isInt(data)) {
        return <>{data.toString()} </>
    } else {
        return <>{JSON.stringify(data)}</>
    }
}

export function NodeCell({data}: { data: Node }) {
    return <>
        {data.labels.map(l =>
            <Popover title={"Properties"} content={(<NodeProperties data={data}></NodeProperties>)} trigger={["click"]}>
                <Badge count={l}/>
            </Popover>
        )}
    </>
}

export function NodeProperties({data}: { data: Node }) {
    const columns: ColumnsType<[string, unknown]> = [
        {
            title: "Key",
            dataIndex: 0,
            key: "key",
        },
        {
            title: "Value",
            dataIndex: 1,
            key: "value",
            render: v => <PrimitiveCell data={v}/>
        }
    ]
    return <Table columns={columns} dataSource={Object.entries(data.properties)} pagination={false}></Table>
}


export function RelationshipCell({data}: { data: Relationship }) {
    return <>
        <Popover title={"Properties"} content={(<RelationshipProperties data={data}></RelationshipProperties>)}
                 trigger={["click"]}>
            <Badge count={data.type}/>
        </Popover>
    </>
}


export function RelationshipProperties({data}: { data: Relationship }) {
    const columns: ColumnsType<[string, unknown]> = [
        {
            title: "Key",
            dataIndex: 0,
            key: "key",
        },
        {
            title: "Value",
            dataIndex: 1,
            key: "value",
            render: v => <PrimitiveCell data={v}/>
        }
    ]
    return <Table columns={columns} dataSource={Object.entries(data.properties)} pagination={false}></Table>
}