import { useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import type { User } from '../types'

export const inp = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-base'
export function Btn({ v = 'p', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { v?: 'p' | 's' | 'd' }) {
  const c = { p: 'bg-teal-700 text-white', s: 'bg-stone-200 text-stone-800', d: 'bg-red-50 text-red-700 border border-red-200' }[v]
  return <button type="button" {...p} className={`min-h-11 rounded-lg px-4 font-semibold active:opacity-70 ${c} ${className}`} />
}
export const Card = ({ title, children }: { title?: ReactNode; children: ReactNode }) => (
  <section className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
    {title && <h2 className="text-lg font-bold text-teal-900">{title}</h2>}{children}
  </section>)
export const Label = ({ t, children }: { t: string; children: ReactNode }) => (
  <label className="block space-y-1"><span className="text-sm font-semibold text-stone-600">{t}</span>{children}</label>)
export const Empty = ({ t }: { t: string }) => <p className="py-3 text-center text-stone-500">{t}</p>
export const confirmDelete = () => window.confirm('本当に削除しますか？')

/** 利用者セレクタ: 検索 → タップで選択。選択後は名前のみ表示。 */
export function ResidentSelect({ users, value, onChange }: { users: User[]; value: string; onChange: (id: string) => void }) {
  const [q, setQ] = useState('')
  const sel = users.find(u => u.id === value)
  const k = q.replace(/\s+/g, '')
  const list = useMemo(() => users.filter(u => u.active && (!k || (u.name + u.furigana).replace(/\s+/g, '').includes(k))).slice(0, 8), [users, k])
  if (sel) return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-teal-700 bg-teal-50 px-3 py-2">
      <span className="font-bold">{sel.name}<span className="ml-2 text-sm font-normal text-stone-500">{sel.floor}・{sel.area}</span></span>
      <Btn v="s" onClick={() => { onChange(''); setQ('') }}>変更</Btn>
    </div>)
  return (
    <div className="space-y-1">
      <input className={inp} placeholder="利用者を検索（例：やまだ）" value={q} onChange={e => setQ(e.target.value)} />
      <div className="max-h-52 overflow-y-auto rounded-lg border border-stone-200 bg-white">
        {list.length === 0 ? <p className="p-3 text-center text-sm text-stone-500">{users.length ? '該当なし' : '設定で利用者を登録してください'}</p>
          : list.map(u => <button key={u.id} type="button" onClick={() => { onChange(u.id); setQ('') }} className="block min-h-11 w-full border-b px-3 text-left last:border-b-0 active:bg-teal-50">
            {u.name}<span className="ml-2 text-sm text-stone-500">{u.furigana}　{u.floor}・{u.area}</span></button>)}
      </div>
    </div>)
}
