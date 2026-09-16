import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/design-system.css'
import './styles/component-primitives.css'
import App from './App.jsx'

import { getInitialTheme, applyTheme } from './lib/themeManager';

// Aplicar tema inicial guardado de forma síncrona
applyTheme(getInitialTheme());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
