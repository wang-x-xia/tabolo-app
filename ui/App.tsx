import {PrepareLocal} from "./json/PrepareLocal.tsx";
import {SetupMenuBar} from "./view/MenuBar.tsx";
import {View} from "./view/View.tsx";

export function App() {
    return <PrepareLocal>
        <SetupMenuBar>
            <View/>
        </SetupMenuBar>
    </PrepareLocal>

}


