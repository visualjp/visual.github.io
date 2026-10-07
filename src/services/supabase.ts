import { createClient } from '@supabase/supabase-js'
const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
/** URLの余計なパス(/rest/v1 や末尾の/)を除去。ダッシュボードURLが貼られた場合はプロジェクトURLに変換 */
function normalize(u?: string) {
  if (!u) return u
  const dash = u.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i)
  if (dash) return `https://${dash[1]}.supabase.co`
  try { return new URL(u).origin } catch { return u }
}
const url = normalize(rawUrl)
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()
/** .env に URL とキーが両方あればクラウド保存、なければこの端末(IndexedDB)に保存 */
export const cloudEnabled = !!(url && key)
/** 片方だけ設定されている等の設定ミス */
export const cloudConfigError = !cloudEnabled && (url || key) ? 'VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY の両方が必要です' : ''
export const sb = cloudEnabled ? createClient(url!, key!) : null
console.info('[storage] backend =', cloudEnabled ? 'supabase' : 'indexeddb (この端末のみ)', cloudConfigError)
