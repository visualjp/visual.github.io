export type Floor = '2階' | '3階'
export type Area = '山' | '海' | '光'
export type Category = '事故' | '経過観察' | '申し送り'
export interface User { id: string; name: string; furigana: string; floor: Floor; area: Area; active: boolean }
export type LeaderType = 'bathDay' | 'bath' | 'short' | 'visit' | 'event'
/** bathDay: customType=weekday / short: status=入所|退所 / event: customType=種類, status=内容 */
export interface LeaderEntry {
  id: string; date: string; type: LeaderType; userId?: string; time?: string
  status?: string; customType?: string; createdAt: number; updatedAt: number
}
export interface Moshiokuri {
  id: string; date: string; floor: Floor; category: Category; userId: string
  content: string; status: '継続' | '終了'; createdAt: number; updatedAt: number
}
export interface MoshiokuriNote {
  id: string; area: Area; date: string; userId: string; content: string
  createdAt: number; updatedAt: number; expiresAt: number
}
export interface CustomEventType { id: string; name: string }
