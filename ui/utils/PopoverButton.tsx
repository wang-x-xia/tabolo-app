import {
    autoUpdate,
    flip,
    FloatingFocusManager,
    offset,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useRole
} from "@floating-ui/react";
import {Button, type ButtonProps} from "flowbite-react";
import {type PropsWithChildren, useState} from "react";

export function PopoverButton({name, size, children}: PropsWithChildren<{ name: string, size?: ButtonProps["size"] }>) {
    const [isOpen, setIsOpen] = useState(false)

    const {refs, floatingStyles, context} = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        middleware: [offset(10), flip(), shift()],
        whileElementsMounted: autoUpdate,
    });

    const click = useClick(context)
    const dismiss = useDismiss(context)
    const role = useRole(context)

    const {getReferenceProps, getFloatingProps} = useInteractions([
        click,
        dismiss,
        role,
    ])

    // @ts-ignore
    return <>
        <Button ref={refs.setReference} size={size} {...getReferenceProps()}>
            {name}
        </Button>
        {isOpen && <FloatingFocusManager context={context} modal={false}>
            <div ref={refs.setFloating} className="z-10 p-2 bg-white rounded shadow"
                 style={floatingStyles} {...getFloatingProps()}>
                {children}
            </div>
        </FloatingFocusManager>
        }
    </>
}