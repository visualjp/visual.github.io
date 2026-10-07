import { useEffect, useMemo, useState } from 'react'
import { FuriganaCtx, FuriganaToggle } from './components/Furigana'
import { useTable } from './hooks/useTable'
import { repo, cloudEnabled, cloudConfigError } from './services'
import { buildDict, loadTokenizer } from './utils/furigana'
import { jpDate, ymd } from './utils/date'
import LeaderPage from './pages/LeaderPage'
import SlipPage from './pages/SlipPage'
import NotePage from './pages/NotePage'
import SummaryPage from './pages/SummaryPage'
import SettingsPage from './pages/SettingsPage'
import ReadingMode from './pages/ReadingMode'

const TABS = ['リーダー', '利用者申し送り紙', '申し送りノート', '総合申し送り']

export default function App() {
  const users = useTable('users')
  const [tab, setTab] = useState(0), [settings, setSettings] = useState(false), [reading, setReading] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => { loadTokenizer().then(setReady) }, [])
  const [on, setOn] = useState(true), [date, setDate] = useState(ymd(new Date()))
  const dict = useMemo(() => buildDict(users), [users])
  useEffect(() => { repo.purgeExpiredNotes(); const t = setInterval(() => repo.purgeExpiredNotes(), 60000); return () => clearInterval(t) }, [])
  return (
    <FuriganaCtx.Provider value={{ on, setOn, dict, ready }}>
      {reading ? <ReadingMode date={date} onClose={() => setReading(false)} /> : (
        <div className="mx-auto min-h-dvh max-w-2xl pb-28">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-teal-800 px-4 py-2 text-white" style={{ paddingTop: 'max(env(safe-area-inset-top),.5rem)' }}>
            <div><p className="font-bold">{settings ? '設定' : TABS[tab]}</p><p className="text-xs opacity-80">{jpDate(ymd(new Date()))}　{cloudEnabled ? <span>☁ クラウド保存</span> : <span className="rounded bg-amber-300 px-1 font-bold text-stone-900">⚠ この端末のみ（未同期）</span>}</p></div>
            <div className="flex gap-2"><span className="rounded-full bg-white"><FuriganaToggle /></span>
              <button onClick={() => setSettings(!settings)} className="min-h-10 rounded-full bg-white px-3 text-sm font-semibold text-teal-800">{settings ? '戻る' : '設定'}</button></div>
          </header>
          <main className="p-4">
            {cloudConfigError && <p className="mb-3 rounded-lg bg-red-100 p-3 font-bold text-red-800">{cloudConfigError}</p>}
            {settings ? <SettingsPage /> : tab === 0 ? <LeaderPage date={date} setDate={setDate} /> : tab === 1 ? <SlipPage />
              : tab === 2 ? <NotePage /> : <SummaryPage date={date} onRead={() => setReading(true)} />}
          </main>
          <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="mx-auto grid max-w-2xl grid-cols-4">{TABS.map((t, i) =>
              <button key={t} onClick={() => { setTab(i); setSettings(false) }} className={`min-h-14 px-1 text-[11px] font-bold leading-tight ${!settings && tab === i ? 'border-t-2 border-teal-700 text-teal-800' : 'text-stone-500'}`}>{t}</button>)}</div>
          </nav>
        </div>)}
    </FuriganaCtx.Provider>)
}
