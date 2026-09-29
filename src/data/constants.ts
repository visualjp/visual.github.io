import type { Area, Category, Floor } from '../types'
export const FLOORS: Floor[] = ['2階', '3階']
export const CATEGORIES: Category[] = ['事故', '経過観察', '申し送り']
export const AREAS: Area[] = ['山', '海', '光']
export const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']
export const DEFAULT_EVENT_TYPES = ['出発', '受診', '外出', '送迎', 'その他']
export const NOTE_TTL_MS = 7 * 24 * 60 * 60 * 1000

// ⚠ 固定文言: AI・自動処理で絶対に修正しないこと（「押し送り」「今,」も原文のまま）
export const OPENING = '時間になったら、押し送りを始めます。各フロア、準備のほうお願いします。'
export const CLOSING = ['インカムと消毒携帯を持ってお願いします。', '今,一日一日、協力よろしくお願いします。']
