import './App.css'
import {Layout} from "antd";
import {GithubOutlined} from '@ant-design/icons';
import {useState} from "react";
import {Driver} from "neo4j-driver";
import {SetupNeo4j} from "./neo4j/component.tsx";

function App() {
    const [driver, setup] = useState<Driver | null>(null);
    return (
        <>
            <Layout>
                <Layout.Content>
                    {driver == null ? <SetupNeo4j onNeo4jSetup={setup}/> : <span>Connected</span>}
                </Layout.Content>
                <Layout.Footer>
                    Tabolo APP
                    <a href="https://github.com/wang-x-xia/tabolo-app">
                        <GithubOutlined/>
                    </a>
                </Layout.Footer>
            </Layout>
        </>
    )
}

export default App
