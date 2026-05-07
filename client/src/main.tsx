import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { WSProvider } from './context/WSContext'

console.log('Main.tsx loading');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WSProvider>
        <App />
      </WSProvider>
    </BrowserRouter>
  </StrictMode>,
)
