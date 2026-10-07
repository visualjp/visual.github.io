import { dexieRepository } from '../storage/dexieRepository'
import { supabaseRepository } from '../storage/supabaseRepository'
import type { Repository } from '../storage/repository'
import { cloudEnabled } from './supabase'
export { cloudEnabled, sb } from './supabase'
export const localRepo: Repository = dexieRepository
/** 保存先の切り替え: .env があれば Supabase、なければ IndexedDB */
export const repo: Repository = cloudEnabled ? supabaseRepository : dexieRepository
export const newId = () => crypto.randomUUID()
