import { Link, createFileRoute } from '@tanstack/react-router'
import { PageShell, Prose } from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'
import { useState } from 'react'

export const Route = createFileRoute('/contact')({
  staticData: { pageId: 'pg_cT4nWz8pQe1V', funnel: { next: [] } },
  head: () => ({
    links: import.meta.env.VITE_PUBLIC_SITE_URL
      ? [{ rel: 'canonical', href: new URL('/contact', import.meta.env.VITE_PUBLIC_SITE_URL).toString() }]
      : [],
    meta: [
      { title: 'Contact PDF Pilot 5U' },
      { name: 'description', content: 'How to reach the people behind PDF Pilot 5U.' },
    ],
  }),
  component: Contact,
})

function Contact() {
  const { t } = useI18n()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    if (!String(data.get('email') ?? '').trim() || !String(data.get('message') ?? '').trim()) {
      setError('Please enter your email address and message.')
      return
    }
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), email: data.get('email'), topic: data.get('topic'), message: data.get('message'), website: data.get('website') }) })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Unable to send your message.')
      setSent(true)
      event.currentTarget.reset()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to send your message. Please email us directly.')
    }
  }
  return (
    <PageShell eyebrow={t('footer.contact')} title="Get in touch" intro="Questions, bug reports and tool requests are welcome.">
      <Prose>
        <form onSubmit={submit} className="not-prose space-y-5 rounded-2xl border border-line bg-card p-5 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold">Name<input required name="name" autoComplete="name" maxLength={100} className="min-h-12 rounded-xl border border-line bg-paper px-4 font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" /></label>
            <label className="grid gap-2 text-sm font-semibold">Email<input required type="email" name="email" autoComplete="email" maxLength={254} className="min-h-12 rounded-xl border border-line bg-paper px-4 font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" /></label>
          </div>
          <label className="grid gap-2 text-sm font-semibold">Topic<select name="topic" className="min-h-12 rounded-xl border border-line bg-paper px-4 font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"><option>Bug report</option><option>Tool request</option><option>Privacy question</option><option>General question</option></select></label>
          <label className="grid gap-2 text-sm font-semibold">Message<textarea required name="message" rows={6} maxLength={5000} className="rounded-xl border border-line bg-paper px-4 py-3 font-normal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" /></label>
          <label className="absolute -left-[9999px]" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          <p className="text-sm text-muted">Please do not include sensitive personal information or attach a confidential PDF.</p>
          <button type="submit" className="min-h-12 rounded-full bg-accent px-6 font-semibold text-white transition hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Send message</button>
          {error && <p role="alert" className="text-sm font-semibold text-accent-dark">{error}</p>}
          {sent && <p role="status" className="text-sm font-semibold text-accent-dark">Your message was sent successfully.</p>}
        </form>
        <p>
          Prefer email? Contact{' '}
          <a href="mailto:hyxeekhan@gmail.com" className="font-semibold text-accent">hyxeekhan@gmail.com</a>.
        </p>
        <p>
          Please don’t attach the PDF you had trouble with unless you’re comfortable sharing it. Describing the problem
          (which tool, file size, number of pages, and your browser) is usually enough.
        </p>
        <p>
          Many answers are already in the <Link to="/help">Help Center</Link>.
        </p>
      </Prose>
    </PageShell>
  )
}
