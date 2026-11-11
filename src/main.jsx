import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { LEGAL_DOCS } from './legal'

// Páginas legais públicas (/termos, /privacidade, /aviso-medico): fora da app, sem login e sem carregar o bundle da app
const legalPath = window.location.pathname.replace(/\/+$/, '') || '/'
const legalDoc = LEGAL_DOCS[legalPath]

const page = legalDoc
  ? import('./components/legal/LegalPageLayout.jsx').then(({ default: Layout }) => <Layout doc={legalDoc} path={legalPath} />)
  : import('./App.jsx').then(({ default: App }) => <App />)

page.then((element) => {
  createRoot(document.getElementById('root')).render(<StrictMode>{element}</StrictMode>)
})
