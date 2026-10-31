import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { applySavedFontSize } from './components/FontSizeControl'
import './index.css'

applySavedFontSize()

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
