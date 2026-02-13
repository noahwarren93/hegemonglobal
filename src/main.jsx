import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css'
import './styles/globe.css'
import './styles/sidebar.css'
import './styles/modals.css'
import './styles/stocks.css'
import './styles/trade-routes.css'
import './styles/compare.css'
import './styles/responsive.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
