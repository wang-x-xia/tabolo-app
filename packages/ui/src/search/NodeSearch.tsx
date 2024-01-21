import {Button, Select, TextInput} from "flowbite-react";
import {type ReactNode, useEffect, useState} from "react";
import {
    emptySearcher,
    type MatchAllSearcher,
    NodeSearcher,
    type PropertySearcher,
    type TypeSearcher
} from "tabolo-core";
import {TypeSelect} from "../edit/TypeSelect.tsx";
import {PopoverButton} from "../utils/PopoverButton.tsx";

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

    const typeSelect = <>
        <Select className="min-w-xs max-w-sm" value={data.type}
                onChange={e => updateType(e.target.value)}>
            <option value="empty">Search All</option>
            <option value="type">Match Type</option>
            <option value="eq">Match Property</option>
            <option value="and">All Match</option>
        </Select>
    </>

    let searcher
    switch (local.type) {
        default:
        case "empty":
            searcher = typeSelect
            break;
        case "type":
            searcher = <NodeTypeSearch data={local} onChange={onChange} typeSelect={typeSelect}/>
            break;
        case "eq":
            searcher = <NodeEqSearch data={local} onChange={onChange} typeSelect={typeSelect}/>
            break;
        case "and":
            searcher = <NodeMatchAllSearch data={local} onChange={onChange} typeSelect={typeSelect}/>
            break;
    }

    return <div className="flex items-baseline space-x-2">
        {searcher}

    </div>
}

interface SearchProps<T extends NodeSearcher> {
    data: T,
    typeSelect: ReactNode,

    onChange(data: T): void,
}

function NodeTypeSearch({data, onChange, typeSelect}: SearchProps<TypeSearcher>) {
    return <>
        <PopoverButton name="Type =">{typeSelect}</PopoverButton>
        <TypeSelect type={data.value} source="Node" onChange={(value) => onChange({...data, "value": value})}/>
    </>
}


function NodeEqSearch({data, onChange, typeSelect}: SearchProps<PropertySearcher>) {
    return <>
        <TextInput
            placeholder="JSON Path"
            value={data.jsonPath}
            onChange={e => onChange({...data, jsonPath: e.target.value})}/>
        <PopoverButton name="=">
            {typeSelect}
        </PopoverButton>
        <TextInput
            placeholder="Expected Value"
            value={data.value}
            onChange={e => onChange({...data, value: e.target.value})}/>
    </>
}

function NodeMatchAllSearch({data, onChange, typeSelect}: SearchProps<MatchAllSearcher<NodeSearcher>>) {
    return <>
        {data.searchers.map(item => <>
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
            <span className="text-sm"> and </span>
        </>)}
        <Button onClick={() => onChange({...data, searchers: [...data.searchers, emptySearcher()]})}>New</Button>
        {typeSelect}
    </>
}