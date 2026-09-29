import { useEffect, useState } from 'react'
import { repo } from '../services'
import type { TableMap, TableName } from '../storage/repository'

/** リアルタイム購読。他タブでの変更は総合申し送りに即反映される。 */
export function useTable<T extends TableName>(table: T): TableMap[T][] {
  const [rows, setRows] = useState<TableMap[T][]>([])
  useEffect(() => repo.watch(table, setRows), [table])
  return rows
}
