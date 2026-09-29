import { Btn } from '../components/ui'
import { FuriganaToggle } from '../components/Furigana'
import { SummaryBody } from '../components/SummaryBody'

export default function ReadingMode({ date, onClose }: { date: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-white">
      <div className="sticky top-0 flex items-center justify-between border-b bg-white/95 px-4 py-2" style={{ paddingTop: 'max(env(safe-area-inset-top),.5rem)' }}>
        <FuriganaToggle /><Btn v="s" onClick={onClose}>終了</Btn>
      </div>
      <div className="mx-auto max-w-2xl p-5 pb-20"><SummaryBody leaderDate={date} big /></div>
    </div>)
}
