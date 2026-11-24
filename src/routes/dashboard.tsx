import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowUpRight, FileText, Heart, LogOut, Settings, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageShell } from '#/components/PageShell'
import { getTool } from '#/lib/tools'
import { formatBytes } from '#/lib/pdf'
import { getSupabase, type FavoriteRecord, type ProcessingRecord } from '#/lib/supabase'

type DashboardData = {
  email: string
  displayName: string
  history: ProcessingRecord[]
  favorites: FavoriteRecord[]
  todayUsage: number
  plan: 'free' | 'pro'
  subscriptionStatus: string
}

type LoadState = { phase: 'loading' } | { phase: 'error'; message: string } | { phase: 'ready'; data: DashboardData }

export const Route = createFileRoute('/dashboard')({
  head: () => ({ meta: [{ title: 'Dashboard — PDF Pilot 5U' }, { name: 'description', content: 'View your PDF Pilot 5U account, favorites and processing history.' }] }),
  component: Dashboard,
})

function Dashboard() {
  const navigate = useNavigate()
  const [state, setState] = useState<LoadState>({ phase: 'loading' })
  const [notice, setNotice] = useState('')

  const load = async () => {
    try {
      const supabase = getSupabase()
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const user = sessionData.session?.user
      if (!user) {
        await navigate({ to: '/login' })
        return
      }
      const since = new Date()
      since.setHours(0, 0, 0, 0)
      const [profile, history, favorites, count, subscription] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
        supabase.from('processing_history').select('id,operation,input_count,output_count,output_bytes,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('favorite_tools').select('id,tool_slug,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(12),
        supabase.from('processing_history').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', since.toISOString()),
        supabase.from('subscriptions').select('plan,status').eq('user_id', user.id).maybeSingle(),
      ])
      const failure = [profile.error, history.error, favorites.error, count.error, subscription.error].find(Boolean)
      if (failure) throw failure
      setState({
        phase: 'ready',
        data: {
          email: user.email ?? '',
          displayName: profile.data?.display_name || user.user_metadata?.name || '',
          history: history.data ?? [],
          favorites: favorites.data ?? [],
          todayUsage: count.count ?? 0,
          plan: subscription.data?.plan === 'pro' && subscription.data.status === 'active' ? 'pro' : 'free',
          subscriptionStatus: subscription.data?.status ?? 'inactive',
        },
      })
    } catch (cause) {
      setState({ phase: 'error', message: cause instanceof Error ? cause.message : 'Could not load your account data.' })
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const toggleFavorite = async (slug: string) => {
    if (state.phase !== 'ready') return
    const item = state.data.favorites.find((favorite) => favorite.tool_slug === slug)
    try {
      const supabase = getSupabase()
      const result = item
        ? await supabase.from('favorite_tools').delete().eq('id', item.id)
        : await supabase.from('favorite_tools').insert({ user_id: (await supabase.auth.getUser()).data.user?.id, tool_slug: slug })
      if (result.error) throw result.error
      setNotice(item ? 'Favorite removed.' : 'Tool added to favorites.')
      await load()
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Could not update favorite.')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await getSupabase().auth.signOut()
      if (error) throw error
      await navigate({ to: '/login' })
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Could not sign out.')
    }
  }

  return (
    <PageShell eyebrow="Your workspace" title="Dashboard" intro="Your files stay on this device. Your account syncs only tool usage and preferences.">
      {state.phase === 'loading' ? (
        <div className="rounded-card border border-line bg-card p-8 text-sm text-muted" role="status">Loading your account…</div>
      ) : state.phase === 'error' ? (
        <div className="rounded-card border border-line bg-card p-6">
          <p role="alert" className="text-sm text-accent-dark">{state.message}</p>
          <button onClick={() => void load()} className="mt-4 rounded-full bg-accent px-5 py-2.5 font-semibold text-white">Try again</button>
        </div>
      ) : (
        <>
          {notice && <p role="status" className="mb-5 rounded-xl border border-line bg-card px-4 py-3 text-sm">{notice}</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={FileText} label="Processed today" value={String(state.data.todayUsage)} />
            <Stat icon={Heart} label="Favorite tools" value={String(state.data.favorites.length)} />
            <Stat icon={ShieldCheck} label="Plan" value={state.data.plan === 'pro' ? 'Pro' : 'Free'} />
            <Stat icon={Sparkles} label="Account" value={state.data.displayName || state.data.email} />
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-card border border-line bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold">Recent processing</h2>
                <Link to="/my-files" className="text-sm font-semibold text-accent hover:text-accent-dark">Local files <ArrowUpRight className="inline size-4" /></Link>
              </div>
              <p className="mt-1 text-sm text-muted">Only operation and size metadata are synced; PDFs and file names are not uploaded.</p>
              {state.data.history.length ? (
                <ul className="mt-4 divide-y divide-line">
                  {state.data.history.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                      <FileText className="size-5 shrink-0 text-accent" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{getTool(item.operation)?.name.en ?? item.operation}</p>
                        <p className="text-xs text-muted">{item.input_count} input · {item.output_count} output · {formatBytes(item.output_bytes)}</p>
                      </div>
                      <time className="text-xs text-muted">{new Date(item.created_at).toLocaleDateString()}</time>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-8 rounded-xl bg-paper p-6 text-center text-sm text-muted">Your processing history will appear here after your first tool run.</p>}
            </section>
            <section className="rounded-card border border-line bg-card p-5 sm:p-6">
              <h2 className="font-display text-xl font-bold">Favorite tools</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {state.data.favorites.map((favorite) => {
                  const tool = getTool(favorite.tool_slug)
                  if (!tool) return null
                  return <Link key={favorite.id} to="/tools/$slug" params={{ slug: tool.slug }} className="rounded-full border border-line px-3 py-2 text-sm font-medium hover:border-accent">{tool.name.en}</Link>
                })}
                {!state.data.favorites.length && <p className="text-sm text-muted">No favorites yet. Add one below.</p>}
              </div>
              <h3 className="mt-6 text-sm font-semibold">Quick add</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {['merge-pdf', 'compress-pdf', 'pdf-to-jpg', 'sign-pdf'].map((slug) => {
                  const tool = getTool(slug)!
                  const favorite = state.data.favorites.some((item) => item.tool_slug === slug)
                  return <button key={slug} onClick={() => void toggleFavorite(slug)} className="rounded-full bg-paper px-3 py-2 text-xs font-medium hover:text-accent">{favorite ? '✓ ' : '+ '}{tool.name.en}</button>
                })}
              </div>
              <div className="mt-6 rounded-xl bg-blush/70 p-4">
                <p className="font-semibold">{state.data.plan === 'pro' ? 'PDF Pilot 5U Pro' : 'Free plan'}</p>
                <p className="mt-1 text-sm text-muted">{state.data.plan === 'pro' ? 'Your subscription is active.' : 'Local browser tools are available. Paid plan checkout is not enabled until billing is configured.'}</p>
              </div>
            </section>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/account" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 font-semibold hover:border-accent"><Settings className="size-4" /> Account settings</Link>
            <button onClick={() => void signOut()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 font-semibold hover:border-accent"><LogOut className="size-4" /> Sign out</button>
          </div>
        </>
      )}
    </PageShell>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return <div className="min-w-0 rounded-card border border-line bg-card p-4"><Icon className="size-5 text-accent" /><p className="mt-3 truncate text-2xl font-bold">{value}</p><p className="mt-1 text-sm text-muted">{label}</p></div>
}
