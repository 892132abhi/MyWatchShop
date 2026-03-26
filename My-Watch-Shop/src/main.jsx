import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import HUB from './AppProvider/HUB.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <HUB>
   <StrictMode>
    <App />
  </StrictMode>
  </HUB>
  </BrowserRouter>
 
)
