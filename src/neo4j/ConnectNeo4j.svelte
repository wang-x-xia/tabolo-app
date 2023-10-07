<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import neo4j, {Driver} from "neo4j-driver"
    import {Button, Checkbox, Input, Label, Modal} from "flowbite-svelte";

    const dispatcher = createEventDispatcher<{ connect: Driver }>()

    let data = {
        uri: "",
        username: "neo4j",
        password: "",
        remember: true,
        auto: true,
    }

    let isConnecting = false

    const store = localStorage.getItem("neo4j-client")
    if (store != null) {
        const loaded = JSON.parse(store)
        data = loaded
        if (loaded.auto) {
            connect()
        }
    }


    async function connect() {
        isConnecting = true
        if (data.remember) {
            localStorage.setItem("neo4j-client", JSON.stringify(data))
        }
        const driver = neo4j.driver(data.uri, neo4j.auth.basic(data.username, data.password),
            {connectionTimeout: 5000})
        try {
            const serverInfo = await driver.getServerInfo()
            console.log(serverInfo)
            dispatcher("connect", driver)
        } catch (e) {
            console.log(e)
            if (data.auto) {
                console.log("Neo4j auto-connect Failed")
            } else {
                console.log("Neo4j connect Failed")
            }
        } finally {
            isConnecting = false
        }
    }
</script>

<Modal open={true} title="Connect to Neo4j">
    <form class="space-y-6" on:submit|preventDefault={connect}>
        <div>
            <Label for="uri">Neo4j URI</Label>
            <Input bind:value={data.uri} id="uri" type="text"/>
        </div>
        <div>
            <Label for="username">
                <span class="label-text">Username</span>
            </Label>
            <Input bind:value={data.username} id="username" type="text"/>
        </div>
        <div>
            <Label for="password">
                <span class="label-text">Password</span>
            </Label>
            <Input bind:value={data.password} id="password" type="password"/>
        </div>
        <div>
            <Checkbox bind:checked={data.remember}>Remember in Browser</Checkbox>
        </div>
        <div>
            <Checkbox bind:checked={data.auto}>Auto Connected</Checkbox>
        </div>
        <Button disabled={isConnecting} type="submit">Submit</Button>
    </form>
</Modal>