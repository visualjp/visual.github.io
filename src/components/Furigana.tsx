import { createContext, useContext } from 'react'
import { furigana, type Dict } from '../utils/furigana'

export const FuriganaCtx = createContext<{ on: boolean; setOn: (v: boolean) => void; dict: Dict; ready?: boolean }>({ on: true, setOn: () => {}, dict: new Map() })
export const useFurigana = () => useContext(FuriganaCtx)

/** 表示専用のふりがな層。元テキストは変更しない。 */
export function R({ children }: { children: string }) {
  const { on, dict } = useFurigana()
  if (!on) return <>{children}</>
  return <>{furigana(children, dict).map((s, i) => s.r ? <ruby key={i}>{s.t}<rt>{s.r}</rt></ruby> : <span key={i}>{s.t}</span>)}</>
}
export function FuriganaToggle() {
  const { on, setOn } = useFurigana()
  return <button onClick={() => setOn(!on)} className="min-h-10 rounded-full border border-teal-700 px-3 text-sm font-semibold text-teal-800">ふりがな {on ? 'ON' : 'OFF'}</button>
}
