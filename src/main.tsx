import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import AuthGate from './components/AuthGate'
import './index.css'

if (import.meta.env.DEV) {
  // 古いPWAキャッシュが .env 変更前のバンドルを返さないようにする
  navigator.serviceWorker?.getRegistrations().then(rs => rs.forEach(r => r.unregister()))
  caches?.keys().then(ks => ks.forEach(k => caches.delete(k)))
} else registerSW({ immediate: true })
createRoot(document.getElementById('root')!).render(<StrictMode><AuthGate><App /></AuthGate></StrictMode>)
