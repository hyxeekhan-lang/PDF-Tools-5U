import { Link, createFileRoute } from '@tanstack/react-router'
import { PageShell } from '#/components/PageShell'
import { POSTS } from '#/lib/blog'
import { useI18n } from '#/lib/i18n'

export const Route = createFileRoute('/blog/')({
  staticData: { pageId: 'pg_bL5gRt8uKo2N', funnel: { next: [] } },
  head: () => ({
    meta: [
      { title: 'Blog — PDFTools' },
      { name: 'description', content: 'Guides to working with PDFs privately in your browser.' },
    ],
  }),
  component: Blog,
})

function Blog() {
  const { t } = useI18n()
  return (
    <PageShell eyebrow={t('nav.blog')} title="Guides and notes" intro="Short, practical guides to working with PDFs in your browser.">
      <ul className="divide-y divide-line border-y border-line">
        {POSTS.map((post) => (
          <li key={post.slug}>
            <Link to="/blog/$slug" params={{ slug: post.slug }} className="group block py-7">
              <p className="text-sm text-muted">{post.date}</p>
              <h2 className="mt-1 font-display text-2xl font-bold group-hover:text-accent">{post.title}</h2>
              <p className="mt-2 text-muted">{post.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
