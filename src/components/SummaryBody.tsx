import { useTable } from '../hooks/useTable'
import { AREAS, CATEGORIES, CLOSING, FLOORS, OPENING } from '../data/constants'
import { leaderText, nm } from '../utils/leaderText'
import { jpMonthDay } from '../utils/date'
import { R } from './Furigana'

const H = ({ children, big }: { children: string; big?: boolean }) =>
  <h2 className={`border-l-4 border-teal-700 pl-3 font-bold text-teal-900 ${big ? 'text-[1.5em]' : 'text-lg'}`}><R>{children}</R></h2>

/** 総合申し送り: Tab1〜3の現在データを購読して直接組み立てる（コピーDBなし）。 */
export function SummaryBody({ leaderDate, big }: { leaderDate: string; big?: boolean }) {
  const users = useTable('users'), leader = useTable('leader'), slips = useTable('slips'), notes = useTable('notes')
  const now = Date.now()
  const P = ({ children }: { children: string }) => <p className="jp"><R>{children}</R></p>
  return (
    <div className={`space-y-6 ${big ? 'text-[1.45rem] leading-[2.4]' : 'text-base'}`}>
      <P>{OPENING}</P>
      <section className="space-y-2"><H big={big}>リーダー</H>
        {leaderText(leader, users, leaderDate).map((l, i) => <P key={i}>{l}</P>)}</section>
      <section className="space-y-3"><H big={big}>利用者申し送り紙</H>
        {FLOORS.map(fl => {
          const cats = CATEGORIES.map(c => ({ c, rows: slips.filter(s => s.floor === fl && s.category === c && s.status === '継続').sort((a, b) => a.date.localeCompare(b.date)) })).filter(x => x.rows.length)
          return cats.length > 0 && <div key={fl} className="space-y-2"><h3 className="font-bold"><R>{fl}</R></h3>
            {cats.map(({ c, rows }) => <div key={c}><h4 className="font-semibold text-stone-600"><R>{c}</R></h4>
              {rows.map(s => <P key={s.id}>{`・${nm(s.userName)}氏（${jpMonthDay(s.date)}）${s.content}`}</P>)}</div>)}</div>
        })}
      </section>
      <section className="space-y-3"><H big={big}>申し送りノート</H>
        {AREAS.map(a => {
          const rows = notes.filter(n => n.area === a && n.expiresAt > now).sort((x, y) => x.createdAt - y.createdAt)
          return rows.length > 0 && <div key={a}><h3 className="font-bold"><R>{a}</R></h3>
            {rows.map(n => <P key={n.id}>{`・${nm(n.userName)}氏　${n.content}`}</P>)}</div>
        })}
      </section>
      <section>{CLOSING.map(l => <P key={l}>{l}</P>)}</section>
    </div>)
}
