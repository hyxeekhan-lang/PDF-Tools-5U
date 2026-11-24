import { createFileRoute } from '@tanstack/react-router'
import { AllTools } from '#/components/AllTools'
import { ToolSearch } from '#/components/ToolSearch'
import { useI18n } from '#/lib/i18n'

export const Route = createFileRoute('/tools/')({
  staticData: { pageId: 'pg_tI8kSa1wEd3F', funnel: { next: [] } },
  head: () => ({
    links: import.meta.env.VITE_PUBLIC_SITE_URL
      ? [{ rel: 'canonical', href: new URL('/tools', import.meta.env.VITE_PUBLIC_SITE_URL).toString() }]
      : [],
    meta: [
      { title: 'All PDF tools — PDF Pilot 5U' },
      { name: 'description', content: 'Merge, split, compress, sign and convert PDFs for free, right in your browser.' },
    ],
  }),
  component: ToolsIndex,
})

function ToolsIndex() {
  const { t } = useI18n()
  return (
    <div>
      <section className="hero-glow border-b border-line">
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-12 lg:px-8">
          <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">{t('nav.allTools')}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{t('all.subtitle')}</p>
          <ToolSearch className="mt-8 max-w-xl" />
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <AllTools />
      </div>
    </div>
  )
}
