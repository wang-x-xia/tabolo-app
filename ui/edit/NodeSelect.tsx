import {Button, Modal} from "flowbite-react";
import {useState} from "react";
import {emptySearcher, type GraphId, type GraphNode, type NodeSearcher} from "../../core";
import {NodeCell} from "../cell/NodeCell.tsx";
import {NodeSearch} from "../search/NodeSearch.tsx";
import {useAsyncOrDefault, useGraph} from "../utils/hooks";

export function NodeSelect({label, selectedId, onSelect}: {
    label: string,
    selectedId?: GraphId,
    onSelect(node: GraphNode): void
}) {
    const [openModal, setOpenModal] = useState(false);
    const [searcher, setSeacher] = useState<NodeSearcher>(emptySearcher())

    const graph = useGraph()

    const nodes = useAsyncOrDefault([], async () => {
        return await graph.searchNodes(searcher)
    }, [searcher])


    function selectNode(node: GraphNode) {
        setOpenModal(false)
        onSelect(node)
    }

    return <>
        <Button onClick={() => setOpenModal(true)}>{label}</Button>
        <Modal show={openModal} onClose={() => setOpenModal(false)} size="7xl">
            <Modal.Header>Select Node</Modal.Header>
            <Modal.Body>
                <NodeSearch data={searcher} onChange={setSeacher}/>
                <div className="flex flex-wrap">
                    {nodes.map(node => <div className="flex flex-col p-2">
                        <NodeCell data={node}/>
                        {
                            node.id === selectedId ?
                                <Button color="success" size="xs" onClick={() => selectNode(node)}>Selected</Button> :
                                <Button size="xs" onClick={() => selectNode(node)}>Select</Button>
                        }
                    </div>)}
                </div>
            </Modal.Body>
        </Modal>
    </>
}