import { useEffect, useState } from 'react'
import BulkImport from '../components/BulkImport'
import { Btn, Card, Empty, Label, NameInput, confirmDelete, inp } from '../components/ui'
import { R } from '../components/Furigana'
import { useTable } from '../hooks/useTable'
import { repo, newId } from '../services'
import { AREAS, NOTE_TTL_MS } from '../data/constants'
import { fmtTime, ymd } from '../utils/date'
import { nm } from '../utils/leaderText'
import type { MoshiokuriNote } from '../types'

type Form = Pick<MoshiokuriNote, 'area' | 'userName' | 'date' | 'content'>
const blank = (): Form => ({ area: '山', userName: '', date: ymd(new Date()), content: '' })

export default function NotePage() {
  const users = useTable('users'), notes = useTable('notes')
  const [open, setOpen] = useState(false), [f, setF] = useState<Form>(blank()), [ed, setEd] = useState<MoshiokuriNote | null>(null)
  useEffect(() => { repo.purgeExpiredNotes() }, []) // 期限切れ(expiresAt <= now)のみ削除
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF(p => ({ ...p, [k]: v }))
  const save = async () => {
    if (!f.userName.trim() || !f.content.trim()) return alert('利用者名と内容を入力してください')
    const now = Date.now()
    await repo.put('notes', { ...f, userName: f.userName.trim(), id: ed?.id ?? newId(), createdAt: ed?.createdAt ?? now, updatedAt: now, expiresAt: ed?.expiresAt ?? now + NOTE_TTL_MS })
    setEd(null); setF({ ...blank(), area: f.area }); setOpen(false)
  }
  const live = notes.filter(n => n.expiresAt > Date.now())
  return (
    <div className="space-y-4">
      {!open && <Btn className="w-full py-4 text-lg" onClick={() => setOpen(true)}>＋ 申し送りを追加</Btn>}
      {!open && <BulkImport mode="notes" />}
      {open && <Card title={ed ? '編集' : '申し送りを追加'}>
        <Label t="エリア"><div className="flex gap-2">{AREAS.map(a => <Btn key={a} v={f.area === a ? 'p' : 's'} className="flex-1 text-lg" onClick={() => set('area', a)}>{a}</Btn>)}</div></Label>
        <Label t="利用者名"><NameInput users={users} value={f.userName} onChange={v => set('userName', v)} /></Label>
        <Label t="日付"><input type="date" className={inp} value={f.date} onChange={e => set('date', e.target.value)} /></Label>
        <Label t="内容"><textarea rows={4} className={inp} value={f.content} onChange={e => set('content', e.target.value)} /></Label>
        <div className="flex gap-2"><Btn className="flex-1" onClick={save}>保存</Btn><Btn v="s" onClick={() => { setOpen(false); setEd(null); setF(blank()) }}>閉じる</Btn></div>
      </Card>}
      {AREAS.map(a => { const rows = live.filter(n => n.area === a).sort((x, y) => y.createdAt - x.createdAt)
        return <Card key={a} title={<R>{a}</R>}>{rows.length === 0 ? <Empty t="申し送りなし" /> : rows.map(n => <div key={n.id} className="border-t py-2">
          <p className="text-sm text-stone-500"><R>{nm(n.userName)}</R>氏　{n.date}　保存期限 {fmtTime(n.expiresAt)}</p>
          <p className="jp"><R>{n.content}</R></p>
          <div className="mt-1 flex gap-2"><Btn v="s" onClick={() => { setEd(n); setF(n); setOpen(true); scrollTo(0, 0) }}>編集</Btn><Btn v="d" onClick={() => confirmDelete() && repo.remove('notes', n.id)}>削除</Btn></div></div>)}</Card> })}
    </div>)
}
