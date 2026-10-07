import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { cloudEnabled, sb } from '../services'
import { Btn, Card, Label, inp } from './ui'

/** クラウド保存時のみ、共有アカウントでのログインを要求する */
export default function AuthGate({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Session | null | undefined>(undefined)
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState('')
  useEffect(() => {
    if (!sb) return
    sb.auth.getSession().then(({ data }) => setS(data.session))
    const { data } = sb.auth.onAuthStateChange((_e, x) => setS(x))
    return () => data.subscription.unsubscribe()
  }, [])
  if (!cloudEnabled || s) return <>{children}</>
  if (s === undefined) return <p className="p-8 text-center text-stone-500">読み込み中…</p>
  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await sb!.auth.signInWithPassword({ email, password: pw })
    setErr(error ? 'メールまたはパスワードが違います' : '')
  }
  return (
    <form onSubmit={login} className="mx-auto max-w-sm space-y-4 p-4 pt-16">
      <Card title="申し送りアプリ ログイン">
        <Label t="メールアドレス"><input className={inp} type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></Label>
        <Label t="パスワード"><input className={inp} type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} /></Label>
        {err && <p className="text-red-700">{err}</p>}
        <Btn className="w-full" type="submit">ログイン</Btn>
      </Card>
    </form>)
}
