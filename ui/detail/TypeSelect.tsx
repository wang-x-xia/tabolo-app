import {
    autoUpdate,
    flip,
    FloatingFocusManager,
    offset,
    shift,
    useDismiss,
    useFloating,
    useFocus,
    useInteractions,
    useRole
} from "@floating-ui/react";
import {textInputTheme} from "flowbite-react/lib/esm/components/TextInput/theme";
import {useMemo, useState} from "react";
import {twMerge} from 'tailwind-merge';
import {useAsyncOrDefault, useGraphMeta} from "../utils/hooks";

const INPUT_CLAZZ = twMerge(
    textInputTheme.field.input.base,
    textInputTheme.field.input.colors["gray"],
    textInputTheme.field.input.sizes["md"],
    textInputTheme.field.input.withAddon['off'],
)

export function TypeSelect({type, source, onChange}: {
    type: string,
    source: "Node" | "Relationship"
    onChange(type: string): void
}) {
    const graphMeta = useGraphMeta()

    const [search, setSearch] = useState("")

    const types = useAsyncOrDefault([], async () => {
        if (source === "Node") {
            return await graphMeta.getNodeTypes()
        } else {
            return await graphMeta.getRelationshipTypes()
        }
    }, [graphMeta, source])

    const searchedTypes = useMemo(() =>
            types.filter(it => it.includes(search)),
        [types, search])

    const [isOpen, setIsOpen] = useState(false)

    const {refs, floatingStyles, context} = useFloating({
        open: isOpen,
        placement: "bottom-start",
        onOpenChange: setIsOpen,
        middleware: [offset(10), flip(), shift()],
        whileElementsMounted: autoUpdate,
    });

    const dismiss = useDismiss(context)
    const focus = useFocus(context)
    const role = useRole(context)

    const {getReferenceProps, getFloatingProps} = useInteractions([
        dismiss,
        focus,
        role,
    ])

    function localOnchange(type: string) {
        setSearch(type)
        onChange(type)
    }

    return <>
        <div className="flex" ref={refs.setReference} {...getReferenceProps()}>
            {isOpen ?
                <input className={INPUT_CLAZZ}
                       placeholder={type}
                       value={search}
                       onChange={e => setSearch(e.target.value)}/> :
                <input className={INPUT_CLAZZ} placeholder={type}/>}
        </div>
        <div>
            {isOpen && <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
                <div ref={refs.setFloating} className="flex flex-col z-10 p-4 space-y-2 bg-white rounded shadow"
                     style={floatingStyles} {...getFloatingProps()}>
                    {searchedTypes.length > 0 ?
                        searchedTypes.map(it => <button
                            key={it}
                            className="p-2 text-sm hover:bg-gray-100"
                            onClick={() => localOnchange(it)}>
                            {it}
                        </button>) :
                        <div className="text-sm font-bold">Not Found</div>}
                </div>
            </FloatingFocusManager>}
        </div>
    </>
}