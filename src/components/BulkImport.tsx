import { useState } from 'react'
import { Btn, Card, inp } from './ui'
import { repo, newId } from '../services'
import { CATEGORIES, FLOORS } from '../data/constants'
import { BULK_PROMPT, parseBulk, type BulkRow } from '../utils/bulkParse'
import type { Category, Floor } from '../types'

/** AI(Gemini等)が読み取ったテキストを貼り付け → 確認・修正 → まとめて保存 */
export default function BulkImport() {
  const [open, setOpen] = useState(false), [text, setText] = useState('')
  const [rows, setRows] = useState<BulkRow[]>([]), [skipped, setSkipped] = useState(0)
  const [floor, setFloor] = useState<Floor>('2階'), [category, setCategory] = useState<Category>('経過観察')
  const upd = (i: number, p: Partial<BulkRow>) => setRows(r => r.map((x, j) => (j === i ? { ...x, ...p } : x)))
  const read = () => { const r = parseBulk(text); setRows(r.rows); setSkipped(r.skipped) }
  const saveAll = async () => {
    const targets = rows.filter(r => r.on && r.name.trim() && r.content.trim())
    let n = 0
    try {
      for (const r of targets) {
        const now = Date.now()
        await repo.put('slips', { id: newId(), date: r.date, floor, category, userName: r.name.trim(), content: r.content.trim(), status: '継続', createdAt: now, updatedAt: now })
        n++
      }
    } catch { return alert(`${n}件保存したところで失敗しました。残りは再度保存してください。`) }
    alert(`${n}件を保存しました`); setRows([]); setText(''); setOpen(false)
  }
  if (!open) return <Btn v="s" className="w-full" onClick={() => setOpen(true)}>📋 AIで読んだテキストをまとめて貼り付け</Btn>
  return (
    <Card title="まとめて貼り付け">
      <Btn v="s" onClick={() => navigator.clipboard.writeText(BULK_PROMPT).then(() => alert('指示文をコピーしました。写真と一緒にAIへ送ってください。'))}>① AIに送る指示文をコピー</Btn>
      <textarea rows={5} className={inp} placeholder="② AIの回答をここに貼り付け（例：石川｜10/4｜転落の為）" value={text} onChange={e => setText(e.target.value)} />
      <Btn onClick={read}>③ 読み取る</Btn>
      {rows.length > 0 && <>
        <div className="grid grid-cols-2 gap-2">
          <select className={inp} value={floor} onChange={e => setFloor(e.target.value as Floor)}>{FLOORS.map(x => <option key={x}>{x}</option>)}</select>
          <select className={inp} value={category} onChange={e => setCategory(e.target.value as Category)}>{CATEGORIES.map(x => <option key={x}>{x}</option>)}</select>
        </div>
        {skipped > 0 && <p className="text-sm text-amber-700">読み取れなかった行: {skipped}件（形式を確認してください）</p>}
        {rows.map((r, i) => <div key={i} className={`space-y-1 rounded-lg border p-2 ${r.on ? '' : 'opacity-40'}`}>
          <div className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={r.on} onChange={e => upd(i, { on: e.target.checked })} />
            <input className={inp} value={r.name} onChange={e => upd(i, { name: e.target.value })} /><input type="date" className={`${inp} w-44`} value={r.date} onChange={e => upd(i, { date: e.target.value })} /></div>
          <textarea rows={2} className={inp} value={r.content} onChange={e => upd(i, { content: e.target.value })} />
        </div>)}
        <Btn className="w-full" onClick={saveAll}>④ 確認して {rows.filter(r => r.on).length}件を保存</Btn>
      </>}
      <Btn v="s" onClick={() => setOpen(false)}>閉じる</Btn>
    </Card>)
}
