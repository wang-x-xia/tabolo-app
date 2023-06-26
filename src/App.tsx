import './App.css'
import {Layout} from "antd";
import {GithubOutlined} from '@ant-design/icons';
import {SetupNeo4j} from "./neo4j/component.tsx";

function App() {
    return (
        <>
            <Layout>
                <Layout.Content>
                    <SetupNeo4j>
                        Content
                    </SetupNeo4j>
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
