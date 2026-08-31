import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/design-system.css'
import './styles/component-primitives.css'
import App from './App.jsx'

// Aplicar tema inicial guardado de forma síncrona
try {
  const savedTheme = localStorage.getItem('saberlab-theme') || localStorage.getItem('theme') || 'dark';
  const resolvedTheme = savedTheme === 'system'
    ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : savedTheme;
  document.documentElement.setAttribute('data-theme', resolvedTheme);
} catch {
  // Ignorar en entornos sin window/localStorage
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
