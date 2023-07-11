import {Driver, Node} from "neo4j-driver";
import {useState} from "react";
import {ViewData} from "./type.ts";
import {Badge, Popover, Table} from "antd";


export function View({driver}: { driver: Driver }) {
    const [viewData, setViewData] = useState<ViewData | null>(null)

    if (viewData == null) {
        async function _() {
            const queryResult = await driver.executeQuery("MATCH (n) RETURN n")
            const tmp: ViewData = {
                headers: [
                    {
                        name: "node",
                        description: "description",
                        key: "m",
                        type: "node"
                    }
                ],
                rows: queryResult.records.map(it => it.toObject())
            }
            console.log(tmp)
            setViewData(tmp)
        }

        _()
    }

    if (viewData == null) {
        return <>
            Loading
        </>
    }

    return <>
        <Table dataSource={viewData.rows}>
            {
                viewData.headers.map(it =>
                    <Table.Column title={it.name}
                                  dataIndex={it.key}
                                  key={it.key}
                                  render={d =>
                                      <NodeCell data={d}/>
                                  }/>)
            }
        </Table>
    </>
}

export function NodeCell({data}: { data: Node }) {
    return <>
        {data.labels.map(l =>
            <Popover title={"Label"} content={<div>Feature to customization label</div>} trigger={["click"]}>
                <Badge count={l}/>
            </Popover>
        )}
    </>
}