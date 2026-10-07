import { ymd } from './date'

export interface BulkRow { on: boolean; name: string; date: string; content: string }

/** Gemini等に読ませるときの指示文。この形式で出力させると確実に取り込める。 */
export const BULK_PROMPT = `この画像の手書きの申し送りを、1件ずつ1行で、次の形式で書き出してください。
名前｜M/D｜内容
・文字は見たまま書き写し、推測で補ったり言い換えたりしないでください。
・読めない文字は□にしてください。
・名前に「さん」は付けないでください。
・日付がない行は日付を空欄にしてください。`

function toDate(s: string): string | null {
  const m = s.match(/(\d{1,2})\s*[\/月]\s*(\d{1,2})/)
  if (!m) return null
  const now = new Date()
  let y = now.getFullYear()
  if (new Date(y, +m[1] - 1, +m[2]).getTime() > now.getTime() + 30 * 864e5) y-- // 年またぎ対策
  return ymd(new Date(y, +m[1] - 1, +m[2]))
}

/** 「名前｜M/D｜内容」または「名前さん … 内容（M/D）」形式の貼り付けテキストを解析。内容の文言は変更しない。 */
export function parseBulk(text: string): { rows: BulkRow[]; skipped: number } {
  const lines = text.split(/\r?\n/).map(l => l.trim().replace(/^([-*•・]\s*|\d+[.)．]\s*)/, '')).filter(Boolean)
  const rows: BulkRow[] = []
  for (const l of lines) {
    let name = '', content = '', date: string | null = null
    if (/[｜|]/.test(l)) {
      const [n, d, ...c] = l.split(/[｜|]/).map(x => x.trim())
      name = n; date = toDate(d ?? ''); content = c.join('｜')
    } else {
      const m = l.match(/^(.+?)(?:さん|氏|様)?\s*(?:[…‥・.:：]+|[-ー〜~]{2,})\s*(.+)$/)
      if (m) { name = m[1]; content = m[2]; date = toDate(m[2]) }
    }
    name = name.replace(/(さん|氏|様)$/, '').trim()
    if (name && content) rows.push({ on: true, name, date: date ?? ymd(new Date()), content })
  }
  return { rows, skipped: lines.length - rows.length }
}
