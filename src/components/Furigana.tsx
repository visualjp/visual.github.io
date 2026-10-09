import { createContext, useContext } from 'react'
import { furigana, type Dict } from '../utils/furigana'

export const FuriganaCtx = createContext<{ on: boolean; setOn: (v: boolean) => void; dict: Dict; ready?: boolean; fixMode: boolean; setFixMode: (v: boolean) => void; fix: (word: string, cur: string) => void }>({ on: true, setOn: () => {}, dict: new Map(), fixMode: false, setFixMode: () => {}, fix: () => {} })
export const useFurigana = () => useContext(FuriganaCtx)

/** 表示専用のふりがな層。元テキストは変更しない。 */
export function R({ children }: { children: string }) {
  const { on, dict, fixMode, fix } = useFurigana()
  if (!on) return <>{children}</>
  return <>{furigana(children, dict).map((s, i) => s.r ? <ruby key={i} onClick={fixMode ? () => fix(s.t, s.r!) : undefined} className={fixMode ? 'cursor-pointer rounded bg-amber-200' : ''}>{s.t}<rt>{s.r}</rt></ruby> : <span key={i}>{s.t}</span>)}</>
}
export function FuriganaToggle() {
  const { on, setOn } = useFurigana()
  return <button onClick={() => setOn(!on)} className="min-h-10 rounded-full border border-teal-700 px-3 text-sm font-semibold text-teal-800">ふりがな {on ? 'ON' : 'OFF'}</button>
}
export function FixToggle() {
  const { on, fixMode, setFixMode } = useFurigana()
  if (!on) return null
  return <button onClick={() => setFixMode(!fixMode)} className={`min-h-10 rounded-full border px-3 text-sm font-semibold ${fixMode ? 'border-amber-500 bg-amber-200 text-stone-900' : 'border-teal-700 text-teal-800'}`}>✎ 読み修正 {fixMode ? 'ON' : 'OFF'}</button>
}
