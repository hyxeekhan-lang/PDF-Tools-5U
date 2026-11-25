import { Link, createFileRoute } from '@tanstack/react-router'
import { Camera, Check, Download, FileCheck2, Gift, Lock, LockKeyhole, MonitorSmartphone, ScanText, ShieldCheck, UserX } from 'lucide-react'
import { AllTools } from '#/components/AllTools'
import { AdSenseUnit } from '#/components/AdSenseUnit'
import { HeroUpload } from '#/components/HeroUpload'
import { DownloadArt, HeroDecor, ProcessArt, Squiggle, StepArrow, UploadArt } from '#/components/Illustrations'
import { ToolSearch } from '#/components/ToolSearch'
import { type TKey, useI18n } from '#/lib/i18n'
import { POPULAR, getTool } from '#/lib/tools'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({
  staticData: { pageId: 'pg_hM1qXe5rTz8C', funnel: { next: [] } },
  head: () => ({
    links: import.meta.env.VITE_PUBLIC_SITE_URL ? [{ rel: 'canonical', href: new URL('/', import.meta.env.VITE_PUBLIC_SITE_URL).toString() }] : [],
    meta: [
      { title: 'PDF Pilot 5U — Everything you need to work with PDFs' },
      {
        name: 'description',
        content: 'Merge, compress, split, sign, convert and edit PDFs in your browser. Optional AI tools send extracted text to Google only after consent; signing in is optional.',
      },
      { property: 'og:url', content: 'https://pdfpilot5u.vercel.app/' },
      { property: 'og:image', content: 'https://pdfpilot5u.vercel.app/brand/pwa-icon-512.png' },
      { property: 'og:image:alt', content: 'PDF Pilot 5U PDF tools' },
      { property: 'og:title', content: 'PDF Pilot 5U — Everything you need to work with PDFs' },
      { property: 'og:description', content: 'Free PDF tools that run in your browser, with optional AI tools and clear consent before text is sent to Google.' },
    ],
  }),
  component: Home,
})

function Home() {
  return (
    <>
      <Hero />
      <ToolsSection />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <AdSenseUnit slot={3} />
      </div>
      <Why />
      <How />
      <Security />
      <CapabilityStrip />
      <AppDownloadAndReviews />
      <Pricing />
      <Faq />
    </>
  )
}

function AppDownloadAndReviews() {
  const [sent, setSent] = useState(false)
  const [reviews, setReviews] = useState<Array<{ name: string; rating: number; review: string }>>([])
  useEffect(() => {
    try { setReviews(JSON.parse(localStorage.getItem('pdfpilot5u-reviews') ?? '[]') as Array<{ name: string; rating: number; review: string }>) } catch { setReviews([]) }
  }, [])
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = [{ name: String(data.get('name') ?? '').trim(), rating: Number(data.get('rating') ?? 5), review: String(data.get('review') ?? '').trim() }, ...reviews].slice(0, 6)
    localStorage.setItem('pdfpilot5u-reviews', JSON.stringify(next))
    setReviews(next)
    setSent(true)
    event.currentTarget.reset()
  }
  return (
    <section className="border-y border-line bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 lg:grid-cols-2 lg:px-8">
        <article className="rounded-card border border-line bg-paper p-7 shadow-[var(--shadow-soft)] md:p-9">
          <div className="flex items-start justify-between gap-5">
            <div className="grid size-16 place-items-center overflow-hidden rounded-[20px] bg-accent shadow-[var(--shadow-soft)] ring-4 ring-blush">
              <img src="/brand/logo-icon.svg" alt="PDF Pilot 5U app logo" className="size-12" />
            </div>
            <span className="rounded-full border border-accent/20 bg-blush px-3 py-1 text-xs font-semibold text-accent-dark">Android APK</span>
          </div>
          <h2 className="mt-6 font-display text-2xl font-extrabold">Use PDF Pilot 5U on Android</h2>
          <p className="mt-3 leading-relaxed text-muted">Download the official PDF Pilot 5U Android wrapper for quick access to browser-based PDF tools on your phone.</p>
          <div className="mt-6 grid gap-3 rounded-2xl border border-line bg-card p-4 text-sm text-muted sm:grid-cols-2">
            <div><span className="block font-semibold text-ink">Quick access</span>Browser-based PDF tools</div>
            <div><span className="block font-semibold text-ink">Package</span>com.webapp.pdfpilot5u</div>
          </div>
          <a href="/downloads/pdf-pilot-5u.apk" download className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 font-semibold text-white hover:bg-accent-dark"><Download className="size-4" aria-hidden="true" /> Download APK</a>
          <p className="mt-3 text-xs text-muted">APK package: com.webapp.pdfpilot5u · Android app download</p>
        </article>
        <article className="rounded-card border border-line bg-paper p-7 shadow-[var(--shadow-soft)] md:p-9">
          <p className="text-sm font-semibold tracking-wide text-accent uppercase">Share your experience</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold">Leave a review</h2>
          <p className="mt-3 leading-relaxed text-muted">Share your experience. Your review appears below on this browser with your name and rating; no email app is opened.</p>
          <form onSubmit={submit} className="mt-5 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input required name="name" maxLength={100} placeholder="Your name" aria-label="Your name" className="min-h-11 rounded-xl border border-line bg-card px-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" />
              <input required type="email" name="email" maxLength={254} placeholder="Email address" aria-label="Email address" className="min-h-11 rounded-xl border border-line bg-card px-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" />
            </div>
            <select name="rating" aria-label="Rating" className="min-h-11 rounded-xl border border-line bg-card px-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"><option value="5">★★★★★ 5 stars</option><option value="4">★★★★☆ 4 stars</option><option value="3">★★★☆☆ 3 stars</option><option value="2">★★☆☆☆ 2 stars</option><option value="1">★☆☆☆☆ 1 star</option></select>
            <textarea required name="review" maxLength={1000} rows={3} placeholder="Write your review" aria-label="Write your review" className="rounded-xl border border-line bg-card px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" />
            <button type="submit" className="min-h-11 rounded-full bg-accent px-5 font-semibold text-white hover:bg-accent-dark">Submit review</button>
            {sent && <p role="status" className="text-sm font-semibold text-accent-dark">Your review is now shown below.</p>}
          </form>
          {reviews.length > 0 && <div className="mt-6 space-y-3" aria-label="User reviews">
            {reviews.map((item, index) => <article key={`${item.name}-${index}`} className="rounded-2xl border border-accent/20 bg-blush p-4">
              <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-accent text-white" aria-hidden="true"><svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="m12 2 2.8 6.1 6.7.8-5 4.6 1.4 6.6-5.9-3.4-5.9 3.4 1.4-6.6-5-4.6 6.7-.8L12 2Z" /></svg></span><div><p className="font-semibold">{item.name}</p><p className="text-sm text-accent" aria-label={`${item.rating} out of 5 stars`}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</p></div></div>
              <p className="mt-3 leading-relaxed text-muted">{item.review}</p>
            </article>)}
          </div>}
        </article>
      </div>
    </section>
  )
}

const stagger = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold tracking-wide text-accent uppercase">{children}</p>
}

function Hero() {
  const { t, pick } = useI18n()
  return (
    <section className="hero-glow relative isolate">
      <HeroDecor />
      <div className="mx-auto max-w-4xl px-5 pt-14 pb-20 text-center md:pt-20 md:pb-24">
        <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-accent/20 bg-blush px-4 py-1.5 text-sm font-semibold text-accent-dark">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent/60" />
            <span className="relative size-2 rounded-full bg-accent" />
          </span>
          {t('hero.badge')}
        </span>
        <h1
          className="animate-fade-up mt-6 font-display text-5xl leading-[1.08] font-extrabold tracking-tight text-balance md:text-7xl"
          style={stagger(90)}
        >
          {t('hero.title')}{' '}
          <span className="relative inline-block text-accent">
            {t('hero.free')}
            <Squiggle />
          </span>
        </h1>
        <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg text-pretty text-muted md:text-xl" style={stagger(180)}>
          {t('hero.subtitle')}
        </p>
        <div className="animate-fade-up mt-10" style={stagger(270)}>
          <HeroUpload />
        </div>
        <div className="animate-fade-up relative z-10" style={stagger(360)}>
          <ToolSearch className="mx-auto mt-8 max-w-xl" />
        </div>
        <AdSenseUnit slot={1} />
        <div className="animate-fade-up mt-8" style={stagger(440)}>
          <p className="text-sm font-semibold text-muted">{t('popular.title')}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {POPULAR.map((slug, i) => {
              const tool = getTool(slug)!
              const Icon = tool.icon
              return (
                <Link
                  key={slug}
                  to="/tools/$slug"
                  params={{ slug }}
                  style={stagger(500 + i * 60)}
                  className="animate-fade-up press group inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold text-accent hover:border-accent/30 hover:text-accent-dark hover:shadow-[var(--shadow-soft)]"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                    <Icon className="size-4" />
                  </span>
                  {pick(tool.name)}
                </Link>
              )
            })}
          </div>
        </div>
        <Link
          to="/tools/$slug"
          params={{ slug: 'scan-to-pdf' }}
          className="animate-fade-up mx-auto mt-10 block max-w-3xl rounded-[28px] border-2 border-accent/25 bg-gradient-to-br from-blush via-card to-paper p-5 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg sm:p-7"
          style={stagger(860)}
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent text-white shadow-md"><Camera className="size-7" aria-hidden="true" /></span>
          <span className="min-w-0 flex-1"><span className="block text-xs font-bold tracking-[.14em] text-accent-dark uppercase">New · Featured scanner</span><span className="mt-1 block font-display text-2xl font-extrabold md:text-3xl">Turn your phone camera into a PDF scanner</span><span className="mt-2 block leading-relaxed text-muted">Capture clean document pages, arrange them, and download one PDF—all privately in your browser.</span></span>
          <span className="shrink-0 text-lg font-bold text-accent" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}

function ToolsSection() {
  const { t } = useI18n()
  return (
    <section id="tools" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-20 md:py-24 lg:px-8">
        <AdSenseUnit slot={2} />
        <div data-reveal className="max-w-2xl">
          <Eyebrow>{t('nav.tools')}</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-balance md:text-4xl">{t('all.title')}</h2>
          <p className="mt-4 text-muted">{t('all.subtitle')}</p>
        </div>
        <div className="mt-12">
          <AllTools />
        </div>
      </div>
    </section>
  )
}

function Why() {
  const { t } = useI18n()
  const items: { icon: typeof Lock; k: 1 | 2 | 3 | 4 }[] = [
    { icon: Lock, k: 1 },
    { icon: UserX, k: 2 },
    { icon: Gift, k: 3 },
    { icon: MonitorSmartphone, k: 4 },
  ]
  return (
    <section id="features" className="scroll-mt-20 bg-blush/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:py-24 lg:grid-cols-[1fr_2fr] lg:px-8">
        <div data-reveal>
          <Eyebrow>{t('why.eyebrow')}</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-balance md:text-4xl">{t('why.title')}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(({ icon: Icon, k }, i) => (
            <div key={k} data-reveal style={stagger(i * 90)}>
            <div className="group h-full rounded-card border border-line bg-card p-6 shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:border-accent/30">
              <span className="grid size-11 place-items-center rounded-xl bg-accent text-white transition-transform duration-300 ease-[var(--ease-spring)] group-hover:-rotate-6 group-hover:scale-110 rtl:group-hover:rotate-6">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold">{t(`why.${k}.t` as TKey)}</h3>
              <p className="mt-1.5 leading-relaxed text-muted">{t(`why.${k}.d` as TKey)}</p>
            </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function How() {
  const { t } = useI18n()
  const steps = [
    { n: 1, Art: UploadArt },
    { n: 2, Art: ProcessArt },
    { n: 3, Art: DownloadArt },
  ] as const
  return (
    <section id="how" className="mx-auto max-w-7xl px-5 py-20 md:py-24 lg:px-8">
      <div data-reveal className="text-center">
        <Eyebrow>{t('how.eyebrow')}</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">{t('how.title')}</h2>
      </div>
      <ol className="mt-14 grid items-start gap-10 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-4">
        {steps.map(({ n, Art }, i) => (
          <li key={n} className="contents">
            <div data-reveal style={stagger(i * 260)} className="group flex flex-col items-center text-center">
              <div className="animate-bob" style={{ '--d': `${i * -2.3}s`, '--dur': '6s' } as React.CSSProperties}>
                <div className="transition-transform duration-500 ease-[var(--ease-spring)] group-hover:scale-105">
                  <Art />
                </div>
              </div>
              <span className="mt-4 font-display text-sm font-bold text-accent tabular-nums">0{n}</span>
              <h3 className="mt-1 font-display text-xl font-bold">{t(`how.${n}.t` as TKey)}</h3>
              <p className="mt-2 max-w-xs text-muted">{t(`how.${n}.d` as TKey)}</p>
            </div>
            {i < steps.length - 1 && (
              <div data-reveal style={stagger(i * 260 + 180)} className="hidden pt-12 md:block" aria-hidden>
                <div className="step-arrow" style={stagger(i * 260 + 260)}>
                  <StepArrow />
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function Security() {
  const { t } = useI18n()
  return (
    <section className="bg-ink text-paper dark:bg-card dark:text-ink">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:py-24 lg:grid-cols-2 lg:px-8">
        <div data-reveal>
          <p className="text-sm font-semibold tracking-wide text-accent uppercase">{t('sec.eyebrow')}</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-balance md:text-4xl">{t('sec.title')}</h2>
          <p className="mt-5 max-w-xl leading-relaxed opacity-75">{t('sec.body')}</p>
        </div>
        <ul className="space-y-3">
          {(['sec.1', 'sec.2', 'sec.3', 'sec.4'] as const).map((k, i) => (
            <li
              key={k}
              data-reveal
              style={stagger(i * 90)}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 dark:border-line dark:bg-paper"
            >
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" />
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function CapabilityStrip() {
  const { t } = useI18n()
  const icons = [FileCheck2, LockKeyhole, ScanText, ShieldCheck] as const
  return (
    <section aria-labelledby="capabilities-title" className="border-y border-line bg-card">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <h2 id="capabilities-title" className="sr-only">
          {t('proof.title')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n, i) => {
            const Icon = icons[i]
            return (
            <article key={n} className="group rounded-2xl border border-line bg-paper px-5 py-6 text-center transition duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[var(--shadow-soft)]">
              <span className="mx-auto grid size-11 place-items-center rounded-xl bg-accent text-white shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <p className="font-display text-2xl font-extrabold">{t(`proof.${n}.title` as TKey)}</p>
              <p className="mt-2 text-sm font-semibold text-muted">{t(`proof.${n}.label` as TKey)}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t(`proof.${n}.description` as TKey)}</p>
            </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const { t } = useI18n()
  return (
    <section id="pricing" className="scroll-mt-20 mx-auto max-w-7xl px-5 py-20 md:py-24 lg:px-8">
      <div data-reveal className="text-center">
        <Eyebrow>{t('price.eyebrow')}</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">{t('price.title')}</h2>
      </div>
      <div
        data-reveal
        style={stagger(120)}
        className="mx-auto mt-12 max-w-md rounded-card border-2 border-accent/30 bg-card p-8 shadow-[var(--shadow-soft)] md:p-10"
      >
        <p className="font-display text-xl font-bold">{t('price.plan')}</p>
        <p className="mt-4 flex items-baseline gap-3">
          <span className="font-display text-6xl font-extrabold" dir="ltr">
            {t('price.amount')}
          </span>
          <span className="text-muted">{t('price.note')}</span>
        </p>
        <ul className="mt-8 space-y-3">
          {(['price.i1', 'price.i2', 'price.i3', 'price.i4'] as const).map((k) => (
            <li key={k} className="flex gap-3">
              <Check className="mt-0.5 size-5 shrink-0 text-accent" />
              {t(k)}
            </li>
          ))}
        </ul>
        <Link
          to="/"
          hash="upload"
          className="press mt-9 flex min-h-12 w-full items-center justify-center rounded-full bg-accent font-semibold text-white hover:bg-accent-dark hover:shadow-md"
        >
          {t('price.cta')}
        </Link>
      </div>
    </section>
  )
}

function Faq() {
  const { t } = useI18n()
  return (
    <section id="faq" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto max-w-3xl px-5 py-20 md:py-24">
        <h2 data-reveal className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          {t('faq.title')}
        </h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {[1, 2, 3, 4, 5, 6, 7].map((n, i) => (
            <details key={n} data-reveal style={stagger(i * 60)} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold">
                {t(`faq.${n}.q` as TKey)}
                <span className="text-2xl text-muted transition duration-300 group-open:rotate-45 group-open:text-ink" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-prose leading-relaxed text-muted">{t(`faq.${n}.a` as TKey)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
