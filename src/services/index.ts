import { dexieRepository } from '../storage/dexieRepository'
import type { Repository } from '../storage/repository'
// ここを差し替えるだけでバックエンドを変更できる
export const repo: Repository = dexieRepository
export const newId = () => crypto.randomUUID()
