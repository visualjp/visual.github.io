import type { User } from '../types'
export interface Seg { t: string; r?: string }
export type Dict = Map<string, string[]>
const KANJI = /([\u4e00-\u9fff々]+)/
// 漢字の直後の(  )が読み。送り仮名つきの語は読みを漢字ごとに書く。
const BASE = `利用者(りようしゃ) 体調(たいちょう) 確認(かくにん) 入浴(にゅうよく) 入所(にゅうしょ) 退所(たいしょ) 面会(めんかい)
出発(しゅっぱつ) 受診(じゅしん) 外出(がいしゅつ) 送迎(そうげい) 予定(よてい) 本日(ほんじつ) 事故(じこ) 経過観察(けいかかんさつ)
申(もう)し送(おく)り 押(お)し送(おく)り 時間(じかん) 準備(じゅんび) 消毒(しょうどく) 携帯(けいたい) 協力(きょうりょく)
持(も)って 願(ねが)い 一日(いちにち) 階(かい) 様(さま) 月(がつ) 日(にち) 時(じ) 山(やま) 海(うみ) 光(ひかり)
月曜日(げつようび) 火曜日(かようび) 水曜日(すいようび) 木曜日(もくようび) 金曜日(きんようび) 土曜日(どようび) 日曜日(にちようび)
血圧(けつあつ) 食事(しょくじ) 転倒(てんとう) 様子(ようす) 観察(かんさつ) 継続(けいぞく) 終了(しゅうりょう)`

function add(dict: Dict, tok: string) {
  const text = tok.replace(/\([^)]*\)/g, '')
  dict.set(text, [...tok.matchAll(/[\u4e00-\u9fff々]+\(([^)]+)\)/g)].map(m => m[1]))
}
/** 基本辞書 + 利用者名（設定の name/furigana から自動生成）。辞書にない漢字はそのまま表示。 */
export function buildDict(users: User[]): Dict {
  const dict: Dict = new Map()
  BASE.split(/\s+/).forEach(t => add(dict, t))
  for (const u of users) {
    const n = u.name.split(/\s+/), f = u.furigana.split(/\s+/)
    if (n.length === f.length) n.forEach((x, i) => f[i] && dict.set(x, [f[i]]))
    else dict.set(u.name.replace(/\s+/g, ''), [u.furigana.replace(/\s+/g, '')])
  }
  return dict
}
export function furigana(text: string, dict: Dict): Seg[] {
  const max = Math.max(...[...dict.keys()].map(k => k.length), 1)
  const out: Seg[] = []
  for (let i = 0; i < text.length;) {
    let hit = ''
    for (let l = Math.min(max, text.length - i); l > 0; l--) {
      const s = text.substr(i, l)
      if (KANJI.test(s) && dict.has(s)) { hit = s; break }
    }
    if (!hit) { out.push({ t: text[i] }); i++; continue }
    const rs = [...(dict.get(hit) ?? [])]
    hit.split(KANJI).forEach((p, k) => { if (p) out.push(k % 2 ? { t: p, r: rs.shift() } : { t: p }) })
    i += hit.length
  }
  return out
}
