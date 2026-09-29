import type { LeaderEntry, User } from '../types'
import { jpMonthDay, weekdayFull } from './date'

export const nameOf = (users: User[], id?: string) => users.find(u => u.id === id)?.name.replace(/\s+/g, '') ?? '（不明）'
const tm = (t = '') => { const [h, m] = t.split(':'); return `${Number(h)}時${m ?? '00'}分` }

export function entryLabel(e: LeaderEntry, users: User[]) {
  const n = e.userId ? nameOf(users, e.userId) + '様' : ''
  if (e.type === 'short') return `${n} ${e.status}`
  if (e.type === 'visit') return `${n} ${tm(e.time)}`
  if (e.type === 'event') return `${n} ${tm(e.time)} ${e.customType}${e.status ? '：' + e.status : ''}`
  return n
}

/** 入力データから読み上げ文を生成（保存せず常に最新データから作る） */
export function leaderText(all: LeaderEntry[], users: User[], date: string): string[] {
  const es = all.filter(e => e.date === date).sort((a, b) => a.createdAt - b.createdAt)
  const of = (t: string) => es.filter(e => e.type === t)
  const lines = [`本日は${jpMonthDay(date)}、${weekdayFull(date)}です。`]
  const bath = [...of('bathDay').map(e => `${e.customType}曜日`), ...of('bath').map(e => nameOf(users, e.userId) + '様')]
  if (bath.length) lines.push(`入浴は${bath.join('、')}です。`)
  const short = of('short').map(e => `${nameOf(users, e.userId)}様が${e.status}`)
  if (short.length) lines.push(`ショートは${short.join('、')}です。`)
  const visit = of('visit').map(e => `${nameOf(users, e.userId)}様、${tm(e.time)}`)
  if (visit.length) lines.push(`面会は${visit.join('、')}です。`)
  of('event').forEach(e => lines.push(`${nameOf(users, e.userId)}様は${tm(e.time)}に${e.customType}予定です。${e.status ? e.status + '。' : ''}`))
  return lines
}
