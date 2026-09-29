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

/** 利用者セレクタ（名前・ふりがなで絞り込み） */
export function ResidentSelect({ users, value, onChange }: { users: User[]; value: string; onChange: (id: string) => void }) {
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const k = q.replace(/\s+/g, '')
    return users.filter(u => u.id === value || (u.active && (!k || (u.name + u.furigana).replace(/\s+/g, '').includes(k))))
  }, [users, q, value])
  return (
    <div className="space-y-1">
      <input className={inp} placeholder="利用者を検索" value={q} onChange={e => setQ(e.target.value)} />
      <select className={inp} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">選択してください</option>
        {list.map(u => <option key={u.id} value={u.id}>{u.name}（{u.floor}・{u.area}）</option>)}
      </select>
    </div>)
}
