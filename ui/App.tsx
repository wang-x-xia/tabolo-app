import {createContext} from "react";
import type {BatchOperation} from "./json/local-json-graph.ts";
import {BatchOpMenuItems, PrepareLocal} from "./json/PrepareLocal.tsx";
import {SetupMenuBar} from "./view/MenuBar.tsx";
import {View} from "./view/View.tsx";

export function App() {
    const batchOp = createContext<BatchOperation>(null as any)
    return <PrepareLocal batchOpKey={batchOp}>
        <SetupMenuBar>
            <BatchOpMenuItems batchOpKey={batchOp}/>
            <View/>
        </SetupMenuBar>
    </PrepareLocal>

}


