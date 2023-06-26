import {Button, Checkbox, Form, Input, message, Modal} from "antd";
import neo4j, {Driver} from "neo4j-driver"
import {useState} from "react";
import {useForm} from "antd/es/form/Form";

interface Neo4jForm {
    uri: string
    username: string
    password: string
    remember: boolean
    auto: boolean
}

export function SetupNeo4j({children}: { children: any }) {
    const [driver, setup] = useState<Driver | null>(null);
    const [connecting, setConnecting] = useState(false)
    const [init, setInit] = useState(false)
    const [form] = useForm<Neo4jForm>()

    const [messageApi, contextHolder] = message.useMessage();

    /**
     * Connect the neo4j server
     */
    async function connect(data: Neo4jForm, {autoConnect} = {autoConnect: false}) {
        if (connecting) {
            return
        }
        if (data.remember) {
            localStorage.setItem("neo4j-client", JSON.stringify(data))
        }
        const driver = neo4j.driver(data.uri,
            neo4j.auth.basic(data.username, data.password),
            {connectionTimeout: 5000})
        try {
            setConnecting(true)
            const serverInfo = await driver.getServerInfo()
            console.log(serverInfo)
            setup(driver)
        } catch (e) {
            console.log(e)
            if (autoConnect) {
                messageApi.error("Neo4j auto-connect Failed")
            } else {
                messageApi.error("Neo4j connect Failed")
            }
        } finally {
            setConnecting(false)
        }
    }

    if (!init) {
        setInit(true)
        const store = localStorage.getItem("neo4j-client")
        if (store == null) {
            form.setFieldsValue({
                username: "neo4j",
                remember: true,
                auto: true
            })
            return
        }
        const loaded = JSON.parse(store) as Neo4jForm
        form.setFieldsValue(loaded)
        if (loaded.auto) {
            connect(loaded, {autoConnect: true})
        }
    }

    return (
        <>
            {children}
            <Modal title="Connect to Neo4j" open={driver === null} footer={null}>
                <Form name="basic" layout="vertical" disabled={connecting} form={form}
                      onFinish={connect}>
                    <Form.Item label="Neo4j URI" name="uri" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>

                    <Form.Item label="Username" name="username" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>

                    <Form.Item label="Password" name="password" rules={[{required: true}]}>
                        <Input.Password/>
                    </Form.Item>

                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" style={{display: "inline-block"}}>
                            <Checkbox>Remember in Browser</Checkbox>
                        </Form.Item>

                        <Form.Item name="auto" valuePropName="checked" style={{display: "inline-block"}}>
                            <Checkbox>Auto Connected</Checkbox>
                        </Form.Item>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {connecting ? "Connecting" : "Connect"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            {contextHolder}
        </>
    )
}
