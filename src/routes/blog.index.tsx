import { Link, createFileRoute } from '@tanstack/react-router'
import { BookOpen, FileArchive, FileText, Files, ScanText, ShieldCheck } from 'lucide-react'
import { PageShell } from '#/components/PageShell'
import { getPostWordCount, getReadingMinutes, POSTS } from '#/lib/blog'
import { useI18n } from '#/lib/i18n'

const POST_ICONS = {
  privacy: ShieldCheck,
  merge: Files,
  compress: FileArchive,
  ocr: ScanText,
  redact: ShieldCheck,
  word: FileText,
} as const

export const Route = createFileRoute('/blog/')({
  staticData: { pageId: 'pg_bL5gRt8uKo2N', funnel: { next: [] } },
  head: () => ({
    links: import.meta.env.VITE_PUBLIC_SITE_URL
      ? [{ rel: 'canonical', href: new URL('/blog', import.meta.env.VITE_PUBLIC_SITE_URL).toString() }]
      : [],
    meta: [
      { title: 'Blog — PDF Pilot 5U' },
      { name: 'description', content: 'Guides to working with PDFs privately in your browser.' },
    ],
  }),
  component: Blog,
})

function Blog() {
  const { t } = useI18n()
  return (
    <PageShell
      eyebrow={t('nav.blog')}
      title="Practical PDF guides"
      intro="Original, independently written guides about PDF workflows, output quality, privacy, and the limits of common conversions. Every article explains the practical steps, trade-offs, and checks that matter before you share a document."
    >
      <ul className="grid gap-5 md:grid-cols-2">
        {POSTS.map((post) => (
          <li key={post.slug} className="min-w-0">
            <Link
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-card transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex min-h-32 items-center gap-4 bg-blush px-6 py-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-accent/15 bg-card text-accent">
                  {(() => {
                    const Icon = POST_ICONS[post.icon]
                    return <Icon aria-hidden="true" className="size-7" />
                  })()}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">{post.date}</p>
                <p className="mt-1 text-sm font-medium text-muted">
                  PDF Pilot 5U guide · {getPostWordCount(post).toLocaleString()} words · {getReadingMinutes(post)} min read
                </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-xl font-bold group-hover:text-accent">{post.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{post.summary}</p>
                <p className="mt-4 flex-1 leading-relaxed text-ink/80">{post.preview}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  <BookOpen aria-hidden="true" className="size-4" />
                  Read the full guide
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  )
}
