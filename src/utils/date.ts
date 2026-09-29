const W = ['日', '月', '火', '水', '木', '金', '土']
export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const jpDate = (s: string) => { const d = parse(s); return `${d.getMonth() + 1}月${d.getDate()}日（${W[d.getDay()]}）` }
export const weekdayFull = (s: string) => `${W[parse(s).getDay()]}曜日`
export const jpMonthDay = (s: string) => { const d = parse(s); return `${d.getMonth() + 1}月${d.getDate()}日` }
export const fmtTime = (ms: number) => { const d = new Date(ms); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
