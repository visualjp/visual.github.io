import { useState } from 'react'
import LeaderBulkImport from '../components/LeaderBulkImport'
import { Btn, Card, Empty, Label, NameInput, confirmDelete, inp } from '../components/ui'
import { R } from '../components/Furigana'
import { useTable } from '../hooks/useTable'
import { repo, newId } from '../services'
import { DEFAULT_EVENT_TYPES, WEEKDAYS } from '../data/constants'
import { jpDate } from '../utils/date'
import { entryLabel, leaderText } from '../utils/leaderText'
import type { LeaderEntry, LeaderType, User } from '../types'

function Section({ type, title, date, users, all }: { type: LeaderType; title: string; date: string; users: User[]; all: LeaderEntry[] }) {
  const custom = useTable('eventTypes')
  const [userName, setU] = useState(''), [time, setT] = useState(''), [content, setC] = useState('')
  const [sub, setSub] = useState(type === 'short' ? '入所' : '出発')
  const rows = all.filter(e => e.type === type && e.date === date)
  const add = async () => {
    if (!userName.trim()) return alert('利用者名を入力してください')
    if ((type === 'visit' || type === 'event') && !time) return alert('時刻を入力してください')
    const now = Date.now()
    const e: LeaderEntry = { id: newId(), date, type, userName: userName.trim(), createdAt: now, updatedAt: now,
      ...(type === 'short' ? { status: sub } : {}), ...(type === 'visit' || type === 'event' ? { time } : {}),
      ...(type === 'event' ? { customType: sub, status: content } : {}) }
    await repo.put('leader', e); setU(''); setT(''); setC('')
  }
  const addType = async () => { const name = prompt('新しい種類の名前')?.trim(); if (name) { await repo.put('eventTypes', { id: newId(), name }); setSub(name) } }
  return (
    <Card title={<R>{title}</R>}>
      {rows.length === 0 ? <Empty t="まだありません" /> : <ul className="divide-y">{rows.map(e =>
        <li key={e.id} className="flex items-center justify-between gap-2 py-2"><span><R>{entryLabel(e)}</R></span>
          <Btn v="d" onClick={() => confirmDelete() && repo.remove('leader', e.id)}>削除</Btn></li>)}</ul>}
      <div className="space-y-2 rounded-lg bg-stone-50 p-3">
        {(type === 'visit' || type === 'event') && <input type="time" className={inp} value={time} onChange={e => setT(e.target.value)} />}
        <NameInput users={users} value={userName} onChange={setU} />
        {type === 'short' && <div className="flex gap-2">{['入所', '退所'].map(s => <Btn key={s} v={sub === s ? 'p' : 's'} className="flex-1" onClick={() => setSub(s)}>{s}</Btn>)}</div>}
        {type === 'event' && <>
          <select className={inp} value={sub} onChange={e => setSub(e.target.value)}>{[...DEFAULT_EVENT_TYPES, ...custom.map(c => c.name)].map(n => <option key={n}>{n}</option>)}</select>
          <input className={inp} placeholder="内容" value={content} onChange={e => setC(e.target.value)} />
          <Btn v="s" onClick={addType}>＋ その他を追加</Btn></>}
        <Btn className="w-full" onClick={add}>＋ 追加</Btn>
      </div>
    </Card>)
}

export default function LeaderPage({ date, setDate }: { date: string; setDate: (d: string) => void }) {
  const users = useTable('users'), all = useTable('leader')
  const [preview, setPreview] = useState(false)
  const days = all.filter(e => e.type === 'bathDay' && e.date === date)
  const toggle = async (w: string) => {
    const ex = days.find(e => e.customType === w)
    if (ex) return repo.remove('leader', ex.id)
    const now = Date.now(); await repo.put('leader', { id: newId(), date, type: 'bathDay', customType: w, createdAt: now, updatedAt: now })
  }
  const p = { date, users, all }
  return (
    <div className="space-y-4">
      <Card title={<R>{jpDate(date)}</R>}>
        <Label t="日付を変更"><input type="date" className={inp} value={date} onChange={e => e.target.value && setDate(e.target.value)} /></Label>
      </Card>
      <LeaderBulkImport date={date} />
      <Card title={<R>入浴</R>}>
        <div className="flex flex-wrap gap-2">{WEEKDAYS.map(w => { const on = days.some(e => e.customType === w)
          return <button key={w} onClick={() => toggle(w)} className={`h-12 w-12 rounded-lg border text-lg font-bold ${on ? 'border-teal-700 bg-teal-700 text-white' : 'border-stone-300 bg-white'}`}>{w}</button> })}</div>
      </Card>
      <Section type="bath" title="入浴（利用者）" {...p} />
      <Section type="short" title="ショート" {...p} />
      <Section type="visit" title="面会" {...p} />
      <Section type="event" title="出発 / その他" {...p} />
      <Btn className="w-full py-4 text-lg" onClick={() => setPreview(!preview)}>申し送りを作成</Btn>
      {preview && <Card title="作成された申し送り">{leaderText(all, users, date).map((l, i) => <p key={i} className="jp"><R>{l}</R></p>)}</Card>}
    </div>)
}
