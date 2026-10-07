import { sb } from '../services/supabase'
import type { Repository } from './repository'

const db = () => sb!
export const supabaseRepository: Repository = {
  watch(table, cb) {
    let alive = true
    const load = async () => {
      const { data, error } = await db().from('records').select('data').eq('tbl', table)
      if (!error && alive) cb((data ?? []).map(r => r.data))
    }
    load()
    // 他の端末の変更を即反映（DELETE は列フィルタ不可のため全イベントで再取得）
    const ch = db().channel(`rt-${table}-${Math.random()}`).on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, load).subscribe()
    return () => { alive = false; db().removeChannel(ch) }
  },
  async put(table, row) {
    const { error } = await db().from('records').upsert({ tbl: table, id: row.id, data: row, expires_at: (row as { expiresAt?: number }).expiresAt ?? null, updated_at: new Date().toISOString() })
    if (error) { alert('保存に失敗しました。通信状況を確認してください。'); throw error }
  },
  async remove(table, id) {
    const { error } = await db().from('records').delete().eq('tbl', table).eq('id', id)
    if (error) { alert('削除に失敗しました。通信状況を確認してください。'); throw error }
  },
  async purgeExpiredNotes() {
    const { data } = await db().from('records').delete().eq('tbl', 'notes').lte('expires_at', Date.now()).select('id')
    return data?.length ?? 0
  },
}
