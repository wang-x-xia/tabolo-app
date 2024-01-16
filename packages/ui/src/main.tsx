import React from 'react'
import ReactDOM from 'react-dom/client'
import './app.css'
import {App} from "./App.tsx";

ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
)
