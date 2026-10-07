import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
/** .env に URL とキーがあればクラウド保存、なければこの端末(IndexedDB)に保存 */
export const cloudEnabled = !!(url && key)
export const sb = cloudEnabled ? createClient(url!, key!) : null
