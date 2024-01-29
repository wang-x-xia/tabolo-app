import {Button, Label, TextInput} from "flowbite-react";
import {JSONPath} from "jsonpath-plus";
import {useMemo} from "react";
import {useForm} from "react-hook-form";
import {PropertyValueCell} from "../cell/PropertyValueCell.tsx";
import {PopoverButton} from "../utils/PopoverButton.tsx";
import type {JsonPathPropertyViewData, PropertyViewData} from "./property.ts";


export function PropertyView({data, config}: {
    data: any,
    config: PropertyViewData,
}) {
    switch (config.type) {
        case "JsonPath":
            return <JsonPathPropertyView data={data} config={config}/>
    }
}

export function JsonPathPropertyView({data, config}: {
    data: any,
    config: JsonPathPropertyViewData,
}) {
    const value = useMemo(() => JSONPath({
        path: config.jsonPath,
        json: data,
        wrap: false
    }), [data, config.jsonPath])

    return <PropertyValueCell data={value}/>
}


export function CreatePropertyPopupButton({name, onCreate}: {
    name: string,
    onCreate(config: PropertyViewData): void
}) {

    const {register, handleSubmit} =
        useForm<Omit<JsonPathPropertyViewData, "type">>()

    function submit(data: Omit<JsonPathPropertyViewData, "type">) {
        onCreate({
            type: "JsonPath",
            ...data,
        })
    }

    return <PopoverButton name={name}>
        <form onSubmit={handleSubmit(submit)}>
            <div>
                <div>
                    <Label htmlFor="create-property-name" value="Name"/>
                </div>
                <TextInput id="create-property-name" {...register("name", {required: true})}/>
            </div>
            <div>
                <div>
                    <Label htmlFor="create-property-json-path" value="JSON Path"/>
                </div>
                <TextInput id="create-property-json-path" {...register("jsonPath", {required: true})}/>
            </div>
            <Button type="submit">Submit</Button>
        </form>
    </PopoverButton>
}