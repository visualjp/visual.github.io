import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) console.warn('\n[warn] .env に VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY が見つかりません → この端末(IndexedDB)のみに保存されます\n')
  return {
  plugins: [
    react(),
    tailwindcss(),
    // manifest lives in public/manifest.webmanifest
    VitePWA({ registerType: 'autoUpdate', manifest: false, workbox: { globPatterns: ['**/*.{js,css,html,png,webmanifest}'], runtimeCaching: [{ urlPattern: /\/dict\//, handler: 'CacheFirst', options: { cacheName: 'dict', expiration: { maxEntries: 20 } } }] } }),
  ],
}
})
