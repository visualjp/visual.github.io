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

export async function copyText(t: string) {
  try { await navigator.clipboard.writeText(t) } catch { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove() }
}
/** AI(Gemini等)に送る指示文と手順の説明（コピーボタン付き） */
export function PromptGuide({ prompt }: { prompt: string }) {
  const [done, setDone] = useState(false)
  return (
    <div className="space-y-2 rounded-lg bg-teal-50 p-3 text-sm">
      <p className="font-bold text-teal-900">使い方</p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>下の指示文をコピー</li>
        <li><a className="font-bold underline" href="https://gemini.google.com/app" target="_blank" rel="noreferrer">Geminiを開く</a>で、写真を添付し、指示文を貼り付けて送信</li>
        <li>返ってきた文章をコピーして、下の枠に貼り付け</li>
        <li>「読み取る」→ 内容を確認・修正 → 保存</li>
      </ol>
      <pre className="whitespace-pre-wrap rounded border bg-white p-2 text-xs">{prompt}</pre>
      <Btn className="w-full" onClick={async () => { await copyText(prompt); setDone(true); setTimeout(() => setDone(false), 2000) }}>{done ? '✔ コピーしました' : '指示文をコピー'}</Btn>
    </div>)
}
