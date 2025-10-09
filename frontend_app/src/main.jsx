import React, { StrictMode } from 'react' // <--- UBAH BARIS INI
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // Sekarang JSX ini kenal 'React'
  <StrictMode> 
    <App />
  </StrictMode>,
)
