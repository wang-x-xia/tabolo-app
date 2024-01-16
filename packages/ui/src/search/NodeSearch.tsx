import {Button, Input, List, Select, Space} from "antd";
import {useEffect, useState} from "react";
import {
    emptySearcher,
    type MatchAllSearcher,
    NodeSearcher,
    type PropertySearcher,
    type TypeSearcher
} from "tabolo-core";
import {TypeSelect} from "../edit/TypeSelect.tsx";

export function NodeSearch({data, onChange}: {
    data: NodeSearcher,
    onChange(data: NodeSearcher): void
}) {

    const [local, setLocal] = useState(data)

    useEffect(() => {
        setLocal(data)
    }, [data]);

    function updateType(type: string) {
        switch (type) {
            case "empty":
                onChange(emptySearcher())
                break
            case "type":
                onChange({type: "type", value: ""})
                break
            case "eq":
                onChange({type: "eq", jsonPath: "", value: ""})
                break
            case "and":
                onChange({type: "and", searchers: []})
                break
        }
    }

    let searcher
    switch (local.type) {
        default:
        case "empty":
            searcher = <></>
            break;
        case "type":
            searcher = <NodeTypeSearch data={local} onChange={onChange}/>
            break;
        case "eq":
            searcher = <NodeEqSearch data={local} onChange={onChange}/>
            break;
        case "and":
            searcher = <NodeMatchAllSearch data={local} onChange={onChange}/>
            break;
    }

    return <>
        {searcher}
        <Select
            defaultValue={data.type}
            style={{width: 120}}
            onChange={e => updateType(e)}
            options={[
                {value: "empty", label: "Search All"},
                {value: "type", label: "Match Type"},
                {value: "eq", label: "Match Property"},
                {value: "and", label: "All Match"},
            ]}
        />
    </>
}

function NodeTypeSearch({data, onChange}: {
    data: TypeSearcher,
    onChange(data: TypeSearcher): void
}) {
    return <TypeSelect
        type={data.value} source="Node"
        onChange={(value) => onChange({...data, "value": value})}/>
}


function NodeEqSearch({data, onChange}: {
    data: PropertySearcher,
    onChange(data: PropertySearcher): void
}) {
    return <Space.Compact block>
        <Input
            value={data.jsonPath}
            onChange={e => onChange({...data, jsonPath: e.target.value})}/>
        <Button>=</Button>

        <Input
            value={data.value}
            onChange={e => onChange({...data, value: e.target.value})}/>
    </Space.Compact>
}

function NodeMatchAllSearch({data, onChange}: {
    data: MatchAllSearcher<NodeSearcher>,
    onChange(data: MatchAllSearcher<NodeSearcher>): void
}) {
    return <List
        bordered
        dataSource={data.searchers}
        footer={<Button onClick={() => onChange({
            ...data,
            searchers: [...data.searchers, emptySearcher()]
        })}>New</Button>}
        renderItem={(item) => <List.Item>
            <NodeSearch data={item} onChange={d => onChange({
                ...data,
                searchers: data.searchers.map(old => {
                    if (old === item) {
                        return d
                    } else {
                        return old
                    }
                })
            })}/>
        </List.Item>}
    />
}