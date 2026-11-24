import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { PageShell } from '#/components/PageShell'
import { getSupabase } from '#/lib/supabase'

export const Route = createFileRoute('/account')({
  head: () => ({ meta: [{ title: 'Account settings — PDF Pilot 5U' }, { name: 'description', content: 'Manage your PDF Pilot 5U account and security.' }] }),
  component: Account,
})

function Account() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const { data, error: authError } = await getSupabase().auth.getUser()
        if (authError) throw authError
        if (!data.user) {
          await navigate({ to: '/login' })
          return
        }
        setEmail(data.user.email ?? '')
        setName(data.user.user_metadata?.name ?? '')
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not load account.')
      }
    }
    void loadAccount()
  }, [navigate])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const { error: updateError } = await getSupabase().auth.updateUser({ data: { name }, ...(password ? { password } : {}) })
      if (updateError) throw updateError
      setPassword('')
      setMessage('Account settings saved.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update account.')
    } finally {
      setBusy(false)
    }
  }

  return <PageShell eyebrow="Account" title="Account settings" intro="Update your profile and password.">
    <form onSubmit={save} className="max-w-xl space-y-5 rounded-card border border-line bg-card p-6">
      <label className="block space-y-1.5 text-sm font-medium">Email<input disabled value={email} className="min-h-11 w-full rounded-xl border border-line bg-paper px-3 disabled:opacity-70" /></label>
      <label className="block space-y-1.5 text-sm font-medium">Display name<input value={name} onChange={(event) => setName(event.target.value)} className="min-h-11 w-full rounded-xl border border-line bg-paper px-3" /></label>
      <label className="block space-y-1.5 text-sm font-medium">New password (optional)<input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-11 w-full rounded-xl border border-line bg-paper px-3" /></label>
      {error && <p role="alert" className="text-sm text-accent-dark">{error}</p>}
      {message && <p role="status" className="text-sm">{message}</p>}
      <button disabled={busy} className="min-h-11 rounded-full bg-accent px-6 font-semibold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save settings'}</button>
    </form>
  </PageShell>
}
