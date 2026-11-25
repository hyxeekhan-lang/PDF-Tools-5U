import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { PageShell } from '#/components/PageShell'
import { getNeonClient } from '#/lib/neon'

export const Route = createFileRoute('/account')({
  head: () => ({ meta: [{ title: 'Account settings — PDF Pilot 5U' }, { name: 'description', content: 'Manage your PDF Pilot 5U account and security.' }] }),
  component: Account,
})

function Account() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const { data, error: authError } = await getNeonClient().auth.getUser()
        if (authError) throw authError
        if (!data.user) {
          await navigate({ to: '/login' })
          return
        }
        setEmail(data.user.email ?? '')
        setName(data.user.user_metadata?.displayName ?? data.user.user_metadata?.name ?? '')
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
      const { error: updateError } = await getNeonClient().auth.updateUser({ data: { name } })
      if (updateError) throw updateError
      setMessage('Account settings saved.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update account.')
    } finally {
      setBusy(false)
    }
  }

  return <PageShell eyebrow="Account" title="Account settings" intro="Update your display name. Password changes use a secure email reset link.">
    <form onSubmit={save} className="max-w-xl space-y-5 rounded-card border border-line bg-card p-6">
      <label className="block space-y-1.5 text-sm font-medium">Email<input disabled value={email} className="min-h-11 w-full rounded-xl border border-line bg-paper px-3 disabled:opacity-70" /></label>
      <label className="block space-y-1.5 text-sm font-medium">Display name<input value={name} onChange={(event) => setName(event.target.value)} className="min-h-11 w-full rounded-xl border border-line bg-paper px-3" /></label>
      {error && <p role="alert" className="text-sm text-accent-dark">{error}</p>}
      {message && <p role="status" className="text-sm">{message}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={busy} className="min-h-11 rounded-full bg-accent px-6 font-semibold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save settings'}</button>
        <Link to="/forgot-password" className="text-sm font-semibold text-accent hover:text-accent-dark">Reset password</Link>
      </div>
    </form>
  </PageShell>
}
