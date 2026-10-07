import { createClient } from '@supabase/supabase-js'
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()
/** .env に URL とキーが両方あればクラウド保存、なければこの端末(IndexedDB)に保存 */
export const cloudEnabled = !!(url && key)
/** 片方だけ設定されている等の設定ミス */
export const cloudConfigError = !cloudEnabled && (url || key) ? 'VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY の両方が必要です' : ''
export const sb = cloudEnabled ? createClient(url!, key!) : null
console.info('[storage] backend =', cloudEnabled ? 'supabase' : 'indexeddb (この端末のみ)', cloudConfigError)
