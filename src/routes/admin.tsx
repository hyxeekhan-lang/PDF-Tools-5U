import { Link, createFileRoute } from '@tanstack/react-router'
import { Activity, CalendarDays, FileText, HardDrive, ShieldCheck, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageShell } from '#/components/PageShell'
import { formatBytes } from '#/lib/pdf'
import { getNeonClient, type ProcessingRecord } from '#/lib/neon'
import { getTool } from '#/lib/tools'

const ADMIN_EMAIL = 'hyxeekhan@gmail.com'

type LoadState =
  | { phase: 'loading' }
  | { phase: 'forbidden'; email?: string }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; email: string; records: ProcessingRecord[] }

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      { title: 'Admin analytics — PDF Pilot 5U' },
      { name: 'description', content: 'Private PDF Pilot 5U activity dashboard.' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  component: Admin,
})

function Admin() {
  const [state, setState] = useState<LoadState>({ phase: 'loading' })

  const load = async () => {
    try {
      const neon = getNeonClient()
      const { data: sessionData, error: sessionError } = await neon.auth.getSession()
      if (sessionError) throw sessionError
      const user = sessionData.session?.user
      const email = user?.email?.trim().toLowerCase()
      if (!user || email !== ADMIN_EMAIL) {
        setState({ phase: 'forbidden', email: user?.email ?? undefined })
        return
      }

      const result = await neon
        .from('processing_history')
        .select('id,operation,input_count,output_count,output_bytes,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500)
      if (result.error) throw result.error
      setState({ phase: 'ready', email: user.email ?? ADMIN_EMAIL, records: result.data ?? [] })
    } catch (cause) {
      setState({ phase: 'error', message: cause instanceof Error ? cause.message : 'Could not load admin activity.' })
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <PageShell eyebrow="Private workspace" title="Admin activity" intro="Signed-in processing activity available to the site owner.">
      {state.phase === 'loading' && <Panel message="Loading private activity…" />}
      {state.phase === 'error' && <ErrorPanel message={state.message} onRetry={() => void load()} />}
      {state.phase === 'forbidden' && (
        <section className="max-w-2xl rounded-card border border-line bg-card p-6 sm:p-8">
          <ShieldCheck className="size-8 text-accent" />
          <h2 className="mt-4 font-display text-2xl font-bold">Private admin area</h2>
          <p className="mt-2 text-muted">This page is restricted to the configured site-owner account.</p>
          {state.email && <p className="mt-3 text-sm text-muted">Signed in as {state.email}</p>}
          <Link to="/login" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-semibold text-white">Sign in with the owner account</Link>
        </section>
      )}
      {state.phase === 'ready' && <AdminContent email={state.email} records={state.records} />}
    </PageShell>
  )
}

function AdminContent({ email, records }: { email: string; records: ProcessingRecord[] }) {
  const totalFiles = records.reduce((sum, item) => sum + item.input_count, 0)
  const totalBytes = records.reduce((sum, item) => sum + item.output_bytes, 0)
  const activeDays = new Set(records.map((item) => new Date(item.created_at).toLocaleDateString())).size
  const byTool = [...records.reduce((map, item) => map.set(item.operation, (map.get(item.operation) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1])
  const byDay = [...records.reduce((map, item) => map.set(new Date(item.created_at).toLocaleDateString(), (map.get(new Date(item.created_at).toLocaleDateString()) ?? 0) + 1), new Map<string, number>())].slice(0, 14).reverse()

  return (
    <>
      <div className="mb-6 rounded-2xl border border-line bg-card px-4 py-3 text-sm text-muted">
        <span className="font-semibold text-ink">Owner:</span> {email} · Data shown: signed-in processing metadata only. PDFs, file names and anonymous visitor activity are not collected here.
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Activity} label="Recorded operations" value={String(records.length)} />
        <Stat icon={FileText} label="Input files processed" value={String(totalFiles)} />
        <Stat icon={CalendarDays} label="Active days" value={String(activeDays)} />
        <Stat icon={HardDrive} label="Output generated" value={formatBytes(totalBytes)} />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section className="rounded-card border border-line bg-card p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Daily activity</h2>
          <p className="mt-1 text-sm text-muted">Latest recorded processing days.</p>
          {byDay.length ? <div className="mt-5 space-y-3">{byDay.map(([day, count]) => <div key={day} className="flex items-center gap-3 text-sm"><time className="w-28 shrink-0 text-muted">{day}</time><div className="h-3 flex-1 overflow-hidden rounded-full bg-paper"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(8, (count / Math.max(...byDay.map(([, value]) => value))) * 100)}%` }} /></div><strong className="w-8 text-right">{count}</strong></div>)}</div> : <Empty />}
        </section>
        <section className="rounded-card border border-line bg-card p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold">Tools used</h2>
          <p className="mt-1 text-sm text-muted">Recorded signed-in operations by tool.</p>
          {byTool.length ? <ul className="mt-4 divide-y divide-line">{byTool.slice(0, 12).map(([operation, count]) => <li key={operation} className="flex items-center justify-between gap-3 py-3"><span className="truncate font-medium">{getTool(operation)?.name.en ?? operation}</span><span className="rounded-full bg-paper px-2.5 py-1 text-xs font-semibold">{count}</span></li>)}</ul> : <Empty />}
        </section>
      </div>
      <section className="mt-8 rounded-card border border-line bg-card p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold">Recent activity</h2>
        {records.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="border-b border-line text-muted"><tr><th className="pb-3 pr-4 font-medium">Tool</th><th className="pb-3 pr-4 font-medium">Files</th><th className="pb-3 pr-4 font-medium">Output</th><th className="pb-3 font-medium">Date</th></tr></thead><tbody className="divide-y divide-line">{records.slice(0, 50).map((item) => <tr key={item.id}><td className="py-3 pr-4 font-medium">{getTool(item.operation)?.name.en ?? item.operation}</td><td className="py-3 pr-4">{item.input_count} in · {item.output_count} out</td><td className="py-3 pr-4">{formatBytes(item.output_bytes)}</td><td className="py-3 text-muted">{new Date(item.created_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <Empty />}
      </section>
      <p className="mt-6 text-sm text-muted"><Users className="mr-1 inline size-4" /> Anonymous visitors and usernames are not shown because this site does not currently store that analytics data. Add a consent-based analytics provider before collecting it.</p>
    </>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return <div className="min-w-0 rounded-card border border-line bg-card p-4"><Icon className="size-5 text-accent" /><p className="mt-3 truncate text-2xl font-bold">{value}</p><p className="mt-1 text-sm text-muted">{label}</p></div>
}

function Panel({ message }: { message: string }) { return <div className="rounded-card border border-line bg-card p-8 text-sm text-muted" role="status">{message}</div> }
function Empty() { return <p className="mt-6 rounded-xl bg-paper p-5 text-center text-sm text-muted">No recorded activity yet.</p> }
function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="rounded-card border border-line bg-card p-6"><p role="alert" className="text-sm text-accent-dark">{message}</p><button onClick={onRetry} className="mt-4 rounded-full bg-accent px-5 py-2.5 font-semibold text-white">Try again</button></div> }
