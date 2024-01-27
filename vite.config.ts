/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import {devGraph} from "./server/dev-graph-vite";

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    plugins: [react(), devGraph()],
    test: {
        environment: "jsdom"
    }
})
