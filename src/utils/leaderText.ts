import type { LeaderEntry, User } from '../types'
import { jpMonthDay, weekdayFull } from './date'

export const nm = (n?: string) => (n ?? '').replace(/\s+/g, '')
const tm = (t = '') => { const [h, m] = t.split(':'); return `${Number(h)}時${m ?? '00'}分` }

/** リーダー画面の一覧表示: 時刻 → 名前 → 内容 の順 */
export function entryLabel(e: LeaderEntry) {
  const n = e.userName ? nm(e.userName) + '様' : ''
  if (e.type === 'short') return `${n} ${e.status}`
  if (e.type === 'visit') return `${tm(e.time)} ${n}`
  if (e.type === 'event') return `${tm(e.time)} ${n} ${e.customType}${e.status ? '：' + e.status : ''}`
  return n
}

/** 入力データから読み上げ文を生成（保存せず常に最新データから作る） */
export function leaderText(all: LeaderEntry[], _users: User[], date: string): string[] {
  const es = all.filter(e => e.date === date).sort((a, b) => a.createdAt - b.createdAt)
  const of = (t: string) => es.filter(e => e.type === t)
  const lines = [`本日は${jpMonthDay(date)}、${weekdayFull(date)}です。`]
  const bath = [...of('bathDay').map(e => `${e.customType}曜日`), ...of('bath').map(e => nm(e.userName) + '様')]
  if (bath.length) lines.push(`入浴は${bath.join('、')}です。`)
  const short = of('short').map(e => `${nm(e.userName)}様が${e.status}`)
  if (short.length) lines.push(`ショートは${short.join('、')}です。`)
  const visit = of('visit').map(e => `${tm(e.time)}、${nm(e.userName)}様`)
  if (visit.length) lines.push(`面会は${visit.join('、')}です。`)
  of('event').forEach(e => lines.push(`${tm(e.time)}に${nm(e.userName)}様は${e.customType}予定です。${e.status ? e.status + '。' : ''}`))
  return lines
}
