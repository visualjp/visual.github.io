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

/** 利用者名: 自由入力 + 登録済みリストからタップで選択（どちらでも可）。 */
export function NameInput({ users, value, onChange }: { users: User[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const k = value.replace(/\s+/g, '')
  const list = useMemo(() => users.filter(u => u.active && (!k || (u.name + u.furigana).replace(/\s+/g, '').includes(k))), [users, k])
  const exact = users.some(u => u.name.replace(/\s+/g, '') === k)
  return (
    <div className="space-y-1">
      <input className={inp} placeholder="利用者名を入力 または 下から選択" value={value}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onChange={e => { onChange(e.target.value); setOpen(true) }} />
      {open && !exact && list.length > 0 && (
        <div className="max-h-52 overflow-y-auto rounded-lg border border-stone-200 bg-white">
          {list.map(u => <button key={u.id} type="button" onMouseDown={e => e.preventDefault()} onClick={() => { onChange(u.name); setOpen(false) }}
            className="block min-h-11 w-full border-b px-3 text-left last:border-b-0 active:bg-teal-50">
            {u.name}<span className="ml-2 text-sm text-stone-500">{u.furigana}　{u.floor}・{u.area}</span></button>)}
        </div>)}
    </div>)
}
