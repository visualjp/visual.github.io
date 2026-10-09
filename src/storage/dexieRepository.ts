import Dexie, { liveQuery } from 'dexie'
import type { Repository, TableName } from './repository'

const db = new Dexie('moshiokuri')
db.version(1).stores({ users: 'id', leader: 'id,date', slips: 'id,floor', notes: 'id,expiresAt', eventTypes: 'id' })

// v2: 利用者を userId 参照から自由入力の userName に変更（既存データを移行）
db.version(2).stores({}).upgrade(async tx => {
  const users = await tx.table('users').toArray()
  for (const t of ['leader', 'slips', 'notes'])
    await tx.table(t).toCollection().modify((r: any) => {
      if ('userId' in r) { r.userName = users.find((u: any) => u.id === r.userId)?.name ?? ''; delete r.userId }
    })
})

db.version(3).stores({ readings: 'id' }) // v3: ふりがな修正辞書

export const dexieRepository: Repository = {
  watch(table, cb) {
    const sub = liveQuery(() => db.table(table).toArray()).subscribe({ next: cb as (r: unknown[]) => void, error: () => console.error('DB error') })
    return () => sub.unsubscribe()
  },
  async put(table, row) { await db.table(table).put(row) },
  async remove(table: TableName, id: string) { await db.table(table).delete(id) },
  purgeExpiredNotes: () => db.table('notes').where('expiresAt').belowOrEqual(Date.now()).delete(),
}
