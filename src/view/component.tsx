import {Driver} from "neo4j-driver";
import {useState} from "react";
import {RowHeader, ViewData} from "./type.ts";
import {Form, Input, Table} from "antd";
import {Cell} from "../cell/component.tsx";

const DEFAULT_QUERY = "MATCH (n) RETURN n"

export function View({driver}: { driver: Driver }) {
    const [viewData, setViewData] = useState<ViewData | null>(null)
    const [querying, setQuerying] = useState<boolean | null>(false)


    async function queryData({query}: { query: string }) {
        setQuerying(true)
        const queryResult = await driver.executeQuery(query)
        const headers: RowHeader[] = queryResult.keys.map(key => {
            return {
                name: key,
                description: key,
                key: key,
                type: "auto"
            }
        });
        const tmp: ViewData = {
            headers: headers,
            rows: queryResult.records.map(it => it.toObject())
        }
        setViewData(tmp)
        setQuerying(false)
    }

    if (viewData == null && !querying) {
        queryData({query: DEFAULT_QUERY})
    }

    return <>
        <Form name="basic" layout="horizontal" onFinish={queryData}>
            <Form.Item label="Query" name="query" initialValue={DEFAULT_QUERY}>
                <Input/>
            </Form.Item>
        </Form>
        <ViewResult data={viewData}></ViewResult>
    </>
}


function ViewResult({data}: { data: ViewData | null }) {
    if (data == null) {
        return <>
            Loading
        </>
    }

    return <Table dataSource={data.rows}>
        {
            data.headers.map(it =>
                <Table.Column title={it.name}
                              dataIndex={it.key}
                              key={it.key}
                              render={d => <Cell header={it} data={d}/>}/>)
        }
    </Table>
}