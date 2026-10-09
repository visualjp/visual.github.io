import { useState } from 'react'
import { Btn, Card, PromptGuide, inp } from './ui'
import { repo, newId } from '../services'
import { LEADER_KINDS, LEADER_PROMPT, parseLeader, type LeaderRow } from '../utils/bulkParse'
import type { LeaderEntry } from '../types'

const NO_TIME = ['入所', '退所']
/** リーダー画面用: AIが読んだ「種類｜時刻｜名前｜内容」をまとめて取り込む（入所/退所=ショート、面会、その他=出発/受診など） */
export default function LeaderBulkImport({ date }: { date: string }) {
  const [open, setOpen] = useState(false), [text, setText] = useState('')
  const [rows, setRows] = useState<LeaderRow[]>([]), [skipped, setSkipped] = useState(0)
  const upd = (i: number, p: Partial<LeaderRow>) => setRows(r => r.map((x, j) => (j === i ? { ...x, ...p } : x)))
  const read = () => { const r = parseLeader(text); setRows(r.rows); setSkipped(r.skipped) }
  const saveAll = async () => {
    const t = rows.filter(r => r.on && r.name.trim())
    if (t.some(r => !NO_TIME.includes(r.kind) && !r.time)) return alert('時刻が空の行があります。入力してください。')
    let n = 0
    try {
      for (const r of t) {
        const now = Date.now(), b = { id: newId(), date, userName: r.name.trim(), createdAt: now, updatedAt: now }
        const e: LeaderEntry = NO_TIME.includes(r.kind) ? { ...b, type: 'short', status: r.kind }
          : r.kind === '面会' ? { ...b, type: 'visit', time: r.time }
          : { ...b, type: 'event', time: r.time, customType: r.kind, status: r.content.trim() }
        await repo.put('leader', e); n++
      }
    } catch { return alert(`${n}件保存したところで失敗しました。残りは再度保存してください。`) }
    alert(`${n}件を保存しました`); setRows([]); setText(''); setOpen(false)
  }
  if (!open) return <Btn v="s" className="w-full" onClick={() => setOpen(true)}>📋 AIで読んだテキストをまとめて貼り付け</Btn>
  return (
    <Card title="まとめて貼り付け（リーダー）">
      <PromptGuide prompt={LEADER_PROMPT} />
      <textarea rows={5} className={inp} placeholder="② AIの回答をここに貼り付け（例：受診｜9:30｜山田｜○○整形）" value={text} onChange={e => setText(e.target.value)} />
      <Btn onClick={read}>③ 読み取る</Btn>
      {skipped > 0 && <p className="text-sm text-amber-700">読み取れなかった行: {skipped}件</p>}
      {rows.map((r, i) => <div key={i} className={`space-y-1 rounded-lg border p-2 ${r.on ? '' : 'opacity-40'}`}>
        <div className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={r.on} onChange={e => upd(i, { on: e.target.checked })} />
          <select className={`${inp} w-28`} value={r.kind} onChange={e => upd(i, { kind: e.target.value })}>{LEADER_KINDS.map(k => <option key={k}>{k}</option>)}</select>
          {!NO_TIME.includes(r.kind) && <input type="time" className={`${inp} w-36`} value={r.time} onChange={e => upd(i, { time: e.target.value })} />}</div>
        <input className={inp} placeholder="利用者名" value={r.name} onChange={e => upd(i, { name: e.target.value })} />
        {!NO_TIME.includes(r.kind) && r.kind !== '面会' && <input className={inp} placeholder="内容" value={r.content} onChange={e => upd(i, { content: e.target.value })} />}
      </div>)}
      {rows.length > 0 && <Btn className="w-full" onClick={saveAll}>④ 確認して {rows.filter(r => r.on).length}件を保存</Btn>}
      <Btn v="s" onClick={() => setOpen(false)}>閉じる</Btn>
    </Card>)
}
