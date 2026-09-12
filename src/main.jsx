import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
// Japanese + latin subsets only (skips the cyrillic/vietnamese subsets the
// full per-weight CSS would otherwise pull in, which this app never renders).
// 400/700 only — 500 dropped since app CSS barely uses it (2 uses of 400,
// 7 of 500, 51 of 700) and each Japanese-weight file is ~1-1.9MB.
import '@fontsource/noto-sans-jp/japanese-400.css'
import '@fontsource/noto-sans-jp/japanese-700.css'
import '@fontsource/noto-sans-jp/latin-400.css'
import '@fontsource/noto-sans-jp/latin-700.css'
import '@fontsource/noto-serif-jp/japanese-400.css'
import '@fontsource/noto-serif-jp/japanese-700.css'
import '@fontsource/noto-serif-jp/latin-400.css'
import '@fontsource/noto-serif-jp/latin-700.css'
import '@/index.scss'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
