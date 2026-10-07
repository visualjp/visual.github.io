import { useState } from 'react'
import { Btn, Card, Empty, Label, confirmDelete, inp } from '../components/ui'
import { useTable } from '../hooks/useTable'
import { repo, localRepo, cloudEnabled, sb, newId } from '../services'
import { AREAS, FLOORS } from '../data/constants'
import { SAMPLE_NOTES, SAMPLE_SLIPS, SAMPLE_USERS } from '../data/sample'
import type { User } from '../types'

const blank = (): User => ({ id: '', name: '', furigana: '', floor: '2階', area: '山', active: true })

export default function SettingsPage() {
  const users = useTable('users')
  const [f, setF] = useState<User>(blank()), [q, setQ] = useState('')
  const set = <K extends keyof User>(k: K, v: User[K]) => setF(p => ({ ...p, [k]: v }))
  const save = async () => {
    if (!f.name.trim() || !f.furigana.trim()) return alert('名前とふりがなを入力してください')
    await repo.put('users', { ...f, id: f.id || newId() }); setF(blank())
  }
  const loadSample = async () => {
    for (const u of SAMPLE_USERS) await repo.put('users', u)
    for (const s of SAMPLE_SLIPS) await repo.put('slips', s)
    for (const n of SAMPLE_NOTES) await repo.put('notes', n)
  }
  const migrate = async () => {
    if (!confirm('この端末のデータをクラウドへコピーしますか？（同じIDは上書き）')) return
    let n = 0
    for (const t of ['users', 'leader', 'slips', 'notes', 'eventTypes'] as const) {
      const rows = await new Promise<unknown[]>(res => { let un = () => {}; un = localRepo.watch(t, r => { un(); res(r) }) })
      for (const r of rows) { await repo.put(t, r as never); n++ }
    }
    alert(`${n}件を移行しました`)
  }
  const k = q.replace(/\s+/g, '')
  const list = users.filter(u => !k || (u.name + u.furigana).replace(/\s+/g, '').includes(k))
  return (
    <div className="space-y-4">
      <Card title={f.id ? '利用者を編集' : '利用者を追加'}>
        <Label t="名前"><input className={inp} placeholder="山田 太郎" value={f.name} onChange={e => set('name', e.target.value)} /></Label>
        <Label t="ふりがな"><input className={inp} placeholder="やまだ たろう" value={f.furigana} onChange={e => set('furigana', e.target.value)} /></Label>
        <div className="grid grid-cols-2 gap-2">
          <Label t="フロア"><select className={inp} value={f.floor} onChange={e => set('floor', e.target.value as User['floor'])}>{FLOORS.map(x => <option key={x}>{x}</option>)}</select></Label>
          <Label t="エリア"><select className={inp} value={f.area} onChange={e => set('area', e.target.value as User['area'])}>{AREAS.map(x => <option key={x}>{x}</option>)}</select></Label>
        </div>
        <label className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={f.active} onChange={e => set('active', e.target.checked)} />利用中</label>
        <div className="flex gap-2"><Btn className="flex-1" onClick={save}>保存</Btn>{f.id && <Btn v="s" onClick={() => setF(blank())}>キャンセル</Btn>}</div>
      </Card>
      <input className={inp} placeholder="利用者を検索" value={q} onChange={e => setQ(e.target.value)} />
      <Card title={`利用者一覧（${list.length}）`}>
        {list.length === 0 ? <Empty t="利用者が登録されていません" /> : list.map(u => <div key={u.id} className="flex items-center justify-between gap-2 border-t py-2">
          <div><p className="font-bold"><ruby>{u.name}<rt>{u.furigana}</rt></ruby></p><p className="text-sm text-stone-500">{u.floor}・{u.area}{u.active ? '' : '（利用停止）'}</p></div>
          <div className="flex gap-2"><Btn v="s" onClick={() => { setF(u); scrollTo(0, 0) }}>編集</Btn><Btn v="d" onClick={() => confirmDelete() && repo.remove('users', u.id)}>削除</Btn></div></div>)}
      </Card>
      <Card title="保存先">
        <p>{cloudEnabled ? 'クラウド（Supabase）— 全員で共有されます' : 'この端末のみ（IndexedDB）'}</p>
        {cloudEnabled && <><Btn v="s" onClick={migrate}>この端末のデータをクラウドへ移行</Btn><Btn v="d" onClick={() => sb?.auth.signOut()}>ログアウト</Btn></>}
      </Card>
      <Card title="テスト用データ">
        <p className="text-sm text-stone-600">データはこの端末のIndexedDBにのみ保存され、外部には送信されません。</p>
        <Btn v="s" onClick={loadSample}>サンプルデータを読み込む</Btn>
      </Card>
    </div>)
}
