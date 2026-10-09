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
      const p = l.split(/[｜|]/).map(x => x.trim())
      if (p.length === 2) { name = p[0]; content = p[1] }          // 名前｜内容
      else { name = p[0]; date = toDate(p[1] ?? ''); content = p.slice(2).join('｜') } // 名前｜M/D｜内容
    } else {
      const m = l.match(/^(.+?)(?:さん|氏|様)?\s*(?:[…‥・.:：]+|[-ー〜~]{2,})\s*(.+)$/)
      if (m) { name = m[1]; content = m[2]; date = toDate(m[2]) }
    }
    name = name.replace(/(さん|氏|様)$/, '').trim()
    if (name && content) rows.push({ on: true, name, date: date ?? ymd(new Date()), content })
  }
  return { rows, skipped: lines.length - rows.length }
}

const COMMON = `・文字は見たまま書き写し、推測で補ったり言い換えたりしないでください。読めない文字は□にしてください。
・名前に「さん」「氏」は付けないでください。
・ふりがな（漢字の上の小さな読み仮名）は書き出さないでください。
・紙の裏から透けて見える薄い文字は無視してください。`
/** 申し送りノート用: 名前｜内容（内容が複数行でも1行にまとめる） */
export const NOTE_PROMPT = `この画像の手書きの申し送りを、1人1行で、次の形式で書き出してください。
名前｜内容
・内容が複数行にわたっても、同じ1行にまとめてください（改行しない）。
${COMMON}`
/** リーダー用 */
export const LEADER_PROMPT = `この画像の手書きの連絡事項を、1件ずつ1行で、次の形式で書き出してください。
種類｜時刻(H:MM)｜名前｜内容
・種類は 入所 / 退所 / 面会 / 受診 / 出発 / 外出 / 送迎 / その他 のいずれか（「SS入所」の欄は入所、「SS退所」の欄は退所）。
・時刻がない種類（入所・退所）は時刻を空欄に。内容がなければ空欄に。
・同じ種類が続く行も、毎回種類を書いてください。
・印刷された文字（「その他」欄の定型項目や人数の表など）は書き出さないでください。
${COMMON}`

export interface LeaderRow { on: boolean; kind: string; time: string; name: string; content: string }
export const LEADER_KINDS = ['入所', '退所', '面会', '出発', '受診', '外出', '送迎', 'その他']
const nt = (s: string) => { const m = s.match(/(\d{1,2})\s*[:：]\s*(\d{2})/); return m ? `${m[1].padStart(2, '0')}:${m[2]}` : '' }

/** 「種類｜時刻｜名前｜内容」または手書きに近い形式（受診 9:30発 山田さん … ○○整形）を解析。種類のない行は前の行を引き継ぐ。 */
export function parseLeader(text: string): { rows: LeaderRow[]; skipped: number } {
  const lines = text.split(/\r?\n/).map(l => l.trim().replace(/^([-*•・]\s*|\d+[.)．]\s*)/, '')).filter(Boolean)
  const rows: LeaderRow[] = []
  let prev = ''
  for (const l of lines) {
    let kind = '', time = '', name = '', content = ''
    if (/[｜|]/.test(l)) {
      const [k, t, n, ...c] = l.split(/[｜|]/).map(x => x.trim())
      kind = LEADER_KINDS.find(x => k.includes(x)) ?? k; time = nt(t ?? ''); name = (n ?? '').replace(/(さん|氏|様)$/, ''); content = c.join('｜')
    } else {
      kind = LEADER_KINDS.find(k => l.includes(k)) ?? ''
      const t = l.match(/(\d{1,2})\s*[:：]\s*(\d{2})/)
      time = t ? nt(t[0]) : ''
      const rest = l.replace(kind, '').replace('SS', '').replace(t?.[0] ?? '', '').replace(/^\s*発?\s*/, '').trim()
      const m = rest.match(/^(.+?)(?:さん|氏|様)?\s*(?:[…‥・.:：]+|[-ー〜~]{2,})\s*(.*)$/)
      if (m) { name = m[1]; content = m[2] } else if (kind || t) name = rest.replace(/(さん|氏|様)$/, '') // 種類も時刻もない印刷文字などは無視
    }
    kind = kind || prev
    if (!kind || !name) continue
    if (!LEADER_KINDS.includes(kind)) { content = content ? `${kind} ${content}` : kind; kind = 'その他' }
    prev = kind
    rows.push({ on: true, kind, time, name: name.trim(), content: content.trim() })
  }
  return { rows, skipped: lines.length - rows.length }
}
