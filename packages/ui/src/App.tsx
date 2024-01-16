import {Layout} from "antd";
import {PrepareLocal} from "./json/PrepareLocal.tsx";
import {View} from "./view/View.tsx";

export function App() {
    return (
        <Layout>
            <Layout.Content>
                <PrepareLocal>
                    <View/>
                </PrepareLocal>
            </Layout.Content>
            <Layout.Footer>
                ©{new Date().getFullYear()}
                <a href="https://github.com/wang-x-xia/tabolo-app">Tabolo</a>
                All Rights Reserved.
            </Layout.Footer>
        </Layout>
    )
}


