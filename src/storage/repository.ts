import type { CustomEventType, LeaderEntry, Moshiokuri, MoshiokuriNote, User } from '../types'

export interface TableMap { users: User; leader: LeaderEntry; slips: Moshiokuri; notes: MoshiokuriNote; eventTypes: CustomEventType }
export type TableName = keyof TableMap

/** UIはこのインターフェースだけに依存する。Supabase/Firebase/PostgreSQL 実装に差し替え可能。 */
export interface Repository {
  watch<T extends TableName>(table: T, cb: (rows: TableMap[T][]) => void): () => void
  put<T extends TableName>(table: T, row: TableMap[T]): Promise<void>
  remove(table: TableName, id: string): Promise<void>
  purgeExpiredNotes(): Promise<number>
}
