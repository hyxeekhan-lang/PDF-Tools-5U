import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Clock, Info, ShieldCheck } from 'lucide-react'
import { ToolCard, ToolIcon } from '#/components/ToolCard'
import { ToolWorkspace } from '#/components/tool/ToolWorkspace'
import { useI18n } from '#/lib/i18n'
import { TOOLS, getTool } from '#/lib/tools'

export const Route = createFileRoute('/tools/$slug')({
  staticData: { pageId: 'pg_tS4hGy9oPn7B', funnel: { next: [] } },
  loader: ({ params }) => {
    const tool = getTool(params.slug)
    if (!tool) throw notFound()
    return { name: tool.name.en, desc: tool.desc.en, soon: tool.status === 'soon' }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: loaderData.soon
              ? `${loaderData.name} (coming soon) — PDFTools`
              : `${loaderData.name} free, in your browser — PDFTools`,
          },
          { name: 'description', content: loaderData.desc },
          { property: 'og:title', content: `${loaderData.name} — PDFTools` },
          { property: 'og:description', content: loaderData.desc },
        ]
      : [],
  }),
  component: ToolPage,
})

function ToolPage() {
  const { slug } = Route.useParams()
  const tool = getTool(slug)!
  const { t, tr, pick } = useI18n()
  const soon = tool.status === 'soon'
  const related = TOOLS.filter((x) => x.slug !== tool.slug && x.status === 'working' && (soon || x.category === tool.category)).slice(0, 4)

  return (
    <div>
      <section className="hero-glow">
        <div className="mx-auto max-w-4xl px-5 pt-12 pb-8 md:pt-16">
          <nav className="text-sm text-muted">
            <Link to="/tools" className="hover:text-accent">
              {t('nav.tools')}
            </Link>
            <span className="mx-2">/</span>
            <span>{t(`cat.${tool.category}` as const)}</span>
          </nav>
          <div className="animate-fade-up mt-5 flex items-start gap-4">
            <ToolIcon tool={tool} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">{pick(tool.name)}</h1>
                {soon ? (
                  <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-muted">{t('tool.soon')}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blush px-3 py-1 text-xs font-semibold text-accent">
                    <ShieldCheck className="size-3.5" />
                    {tr('Runs in your browser', 'آپ کے براؤزر میں')}
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-lg text-muted">{pick(tool.desc)}</p>
            </div>
          </div>
          {tool.note && (
            <p className="mt-5 flex items-start gap-2 rounded-xl border border-line bg-card px-4 py-3 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-accent" />
              {pick(tool.note)}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 pb-16">
        {soon ? (
          <div className="rounded-card border border-dashed border-line bg-card px-6 py-12 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink/5 text-muted">
              <Clock className="size-7" />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold">{t('page.soonTitle')}</h2>
            <p className="mx-auto mt-2 max-w-lg text-muted">{t('page.soonBody')}</p>
          </div>
        ) : (
          <ToolWorkspace key={tool.slug} tool={tool} />
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-5 font-display text-xl font-bold">{t('page.related')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((r, i) => (
                <div key={r.slug} data-reveal style={{ '--d': `${i * 70}ms` } as React.CSSProperties}>
                  <ToolCard tool={r} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
