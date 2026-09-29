import Dexie, { liveQuery } from 'dexie'
import type { Repository, TableName } from './repository'

const db = new Dexie('moshiokuri')
db.version(1).stores({ users: 'id', leader: 'id,date', slips: 'id,floor', notes: 'id,expiresAt', eventTypes: 'id' })

export const dexieRepository: Repository = {
  watch(table, cb) {
    const sub = liveQuery(() => db.table(table).toArray()).subscribe({ next: cb as (r: unknown[]) => void, error: () => console.error('DB error') })
    return () => sub.unsubscribe()
  },
  async put(table, row) { await db.table(table).put(row) },
  async remove(table: TableName, id: string) { await db.table(table).delete(id) },
  purgeExpiredNotes: () => db.table('notes').where('expiresAt').belowOrEqual(Date.now()).delete(),
}
