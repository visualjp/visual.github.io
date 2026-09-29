// テスト用サンプル（設定画面のボタンから読み込む。本番データとは別扱い）
import type { Moshiokuri, MoshiokuriNote, User } from '../types'
import { NOTE_TTL_MS } from './constants'
const t = Date.now()
const d = new Date(t).toISOString().slice(0, 10)
export const SAMPLE_USERS: User[] = [
  { id: 'sample-1', name: '山田 太郎', furigana: 'やまだ たろう', floor: '3階', area: '山', active: true },
  { id: 'sample-2', name: '佐藤 花子', furigana: 'さとう はなこ', floor: '2階', area: '海', active: true },
  { id: 'sample-3', name: '田中 一郎', furigana: 'たなか いちろう', floor: '2階', area: '光', active: true },
]
export const SAMPLE_SLIPS: Moshiokuri[] = [
  { id: 'sample-s1', date: d, floor: '2階', category: '経過観察', userId: 'sample-2', content: '体調を確認する。食事量に注意。', status: '継続', createdAt: t, updatedAt: t },
  { id: 'sample-s2', date: d, floor: '3階', category: '事故', userId: 'sample-1', content: '転倒あり。様子観察中。', status: '継続', createdAt: t, updatedAt: t },
]
export const SAMPLE_NOTES: MoshiokuriNote[] = [
  { id: 'sample-n1', area: '山', date: d, userId: 'sample-1', content: '入浴後の血圧を確認する。', createdAt: t, updatedAt: t, expiresAt: t + NOTE_TTL_MS },
]
