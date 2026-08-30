import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
// Japanese + latin subsets only (skips the cyrillic/vietnamese subsets the
// full per-weight CSS would otherwise pull in, which this app never renders).
import '@fontsource/noto-sans-jp/japanese-400.css'
import '@fontsource/noto-sans-jp/japanese-500.css'
import '@fontsource/noto-sans-jp/japanese-700.css'
import '@fontsource/noto-sans-jp/latin-400.css'
import '@fontsource/noto-sans-jp/latin-500.css'
import '@fontsource/noto-sans-jp/latin-700.css'
import '@fontsource/noto-serif-jp/japanese-400.css'
import '@fontsource/noto-serif-jp/japanese-500.css'
import '@fontsource/noto-serif-jp/japanese-700.css'
import '@fontsource/noto-serif-jp/latin-400.css'
import '@fontsource/noto-serif-jp/latin-500.css'
import '@fontsource/noto-serif-jp/latin-700.css'
import '@/index.scss'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
