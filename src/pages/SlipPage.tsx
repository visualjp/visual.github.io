import { useState } from 'react'
import { Btn, Card, Empty, Label, NameInput, confirmDelete, inp } from '../components/ui'
import { R } from '../components/Furigana'
import { useTable } from '../hooks/useTable'
import { repo, newId } from '../services'
import { CATEGORIES, FLOORS } from '../data/constants'
import { ymd } from '../utils/date'
import { nm } from '../utils/leaderText'
import type { Moshiokuri } from '../types'

type Form = Omit<Moshiokuri, 'id' | 'createdAt' | 'updatedAt'>
const blank = (): Form => ({ floor: '2階', category: '事故', date: ymd(new Date()), userName: '', content: '', status: '継続' })

export default function SlipPage() {
  const users = useTable('users'), slips = useTable('slips')
  const [f, setF] = useState<Form>(blank()), [ed, setEd] = useState<Moshiokuri | null>(null)
  const [q, setQ] = useState(''), [sf, setSf] = useState<'all' | '継続' | '終了'>('all')
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF(p => ({ ...p, [k]: v }))
  const save = async () => {
    if (!f.userName.trim() || !f.content.trim()) return alert('利用者名と内容を入力してください')
    const now = Date.now()
    await repo.put('slips', { ...f, userName: f.userName.trim(), id: ed?.id ?? newId(), createdAt: ed?.createdAt ?? now, updatedAt: now })
    setEd(null); setF({ ...blank(), floor: f.floor })
  }
  const match = (s: Moshiokuri) => {
    const u = users.find(x => nm(x.name) === nm(s.userName)), k = q.replace(/\s+/g, '')
    return (sf === 'all' || s.status === sf) && (!k || (s.content + s.userName + (u?.furigana ?? '')).replace(/\s+/g, '').includes(k))
  }
  return (
    <div className="space-y-4">
      <Card title={ed ? '記録を編集' : '記録を追加'}>
        <div className="grid grid-cols-2 gap-2">
          <Label t="フロア"><select className={inp} value={f.floor} onChange={e => set('floor', e.target.value as Form['floor'])}>{FLOORS.map(x => <option key={x}>{x}</option>)}</select></Label>
          <Label t="カテゴリー"><select className={inp} value={f.category} onChange={e => set('category', e.target.value as Form['category'])}>{CATEGORIES.map(x => <option key={x}>{x}</option>)}</select></Label>
        </div>
        <Label t="日付"><input type="date" className={inp} value={f.date} onChange={e => set('date', e.target.value)} /></Label>
        <Label t="利用者名"><NameInput users={users} value={f.userName} onChange={v => set('userName', v)} /></Label>
        <Label t="内容"><textarea rows={4} className={inp} value={f.content} onChange={e => set('content', e.target.value)} /></Label>
        <div className="flex gap-2">{(['継続', '終了'] as const).map(s => <Btn key={s} v={f.status === s ? 'p' : 's'} className="flex-1" onClick={() => set('status', s)}>{s}</Btn>)}</div>
        <div className="flex gap-2"><Btn className="flex-1" onClick={save}>保存</Btn>{ed && <Btn v="s" onClick={() => { setEd(null); setF(blank()) }}>キャンセル</Btn>}</div>
      </Card>
      <div className="flex gap-2">
        <input className={inp} placeholder="検索（名前・ふりがな・内容）" value={q} onChange={e => setQ(e.target.value)} />
        <select className={`${inp} w-32`} value={sf} onChange={e => setSf(e.target.value as typeof sf)}><option value="all">すべて</option><option value="継続">継続中</option><option value="終了">終了済み</option></select>
      </div>
      {FLOORS.map(fl => <Card key={fl} title={<R>{fl}</R>}>
        {CATEGORIES.map(c => { const rows = slips.filter(s => s.floor === fl && s.category === c && match(s)).sort((a, b) => b.date.localeCompare(a.date))
          return <div key={c}><h3 className="font-bold text-stone-700"><R>{c}</R></h3>
            {rows.length === 0 ? <Empty t="記録なし" /> : rows.map(s => <div key={s.id} className="border-t py-2">
              <p className="text-sm text-stone-500">{s.date}　<R>{nm(s.userName)}</R>様　<span className={s.status === '継続' ? 'font-bold text-teal-700' : ''}>{s.status === '継続' ? '継続中' : '終了済み'}</span></p>
              <p className="jp"><R>{s.content}</R></p>
              <div className="mt-1 flex gap-2"><Btn v="s" onClick={() => { setEd(s); setF(s); scrollTo(0, 0) }}>編集</Btn><Btn v="d" onClick={() => confirmDelete() && repo.remove('slips', s.id)}>削除</Btn></div></div>)}</div> })}
      </Card>)}
    </div>)
}
