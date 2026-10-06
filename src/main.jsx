import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/sofia-sans/400.css'
import '@fontsource/sofia-sans/600.css'
import '@fontsource/sofia-sans/700.css'
import '@fontsource/sofia-sans-extra-condensed/800.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
