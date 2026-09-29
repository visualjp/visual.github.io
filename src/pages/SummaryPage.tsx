import { Btn } from '../components/ui'
import { SummaryBody } from '../components/SummaryBody'

export default function SummaryPage({ date, onRead }: { date: string; onRead: () => void }) {
  return (
    <div className="space-y-4">
      <Btn className="w-full py-4 text-lg" onClick={onRead}>▶ 申し送りを読む</Btn>
      <div className="rounded-xl border border-stone-200 bg-white p-4"><SummaryBody leaderDate={date} /></div>
    </div>)
}
