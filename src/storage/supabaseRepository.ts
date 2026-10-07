import { sb } from '../services/supabase'
import type { Repository } from './repository'

const db = () => sb!
async function ensureSession() {
  const { data } = await db().auth.getSession()
  if (!data.session) throw new Error('ログインしていません（再ログインしてください）')
}
/** 個人情報はログに出さず、操作名・テーブル名・エラー内容のみ出力 */
function report(op: string, table: string, e: unknown) {
  const msg = (e as { message?: string })?.message ?? String(e)
  console.error(`[supabase] ${op} failed (${table}):`, e)
  alert(`${op === 'put' ? '保存' : '削除'}に失敗しました: ${msg}`)
}

export const supabaseRepository: Repository = {
  watch(table, cb) {
    let alive = true
    const load = async () => {
      const { data, error } = await db().from('records').select('data').eq('tbl', table)
      if (error) return console.error(`[supabase] read failed (${table}):`, error)
      if (alive) cb((data ?? []).map(r => r.data))
    }
    load()
    // 他の端末の変更を即反映（DELETE は列フィルタ不可のため全イベントで再取得）
    const ch = db().channel(`rt-${table}-${Math.random()}`).on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, load).subscribe()
    return () => { alive = false; db().removeChannel(ch) }
  },
  async put(table, row) {
    try {
      await ensureSession()
      const { data, error } = await db().from('records')
        .upsert({ tbl: table, id: row.id, data: row, expires_at: (row as { expiresAt?: number }).expiresAt ?? null, updated_at: new Date().toISOString() }, { onConflict: 'tbl,id' })
        .select('id')
      if (error) throw error
      if (!data?.length) throw new Error('0件しか書き込まれませんでした（RLSポリシーを確認）')
    } catch (e) { report('put', table, e); throw e }
  },
  async remove(table, id) {
    try {
      await ensureSession()
      const { error } = await db().from('records').delete().eq('tbl', table).eq('id', id)
      if (error) throw error
    } catch (e) { report('remove', table, e); throw e }
  },
  async purgeExpiredNotes() {
    const { data, error } = await db().from('records').delete().eq('tbl', 'notes').lte('expires_at', Date.now()).select('id')
    if (error) console.error('[supabase] purge failed:', error)
    return data?.length ?? 0
  },
}
