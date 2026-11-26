import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { PageShell, Prose } from '#/components/PageShell'
import { getPostWordCount, getReadingMinutes, POSTS } from '#/lib/blog'

export const Route = createFileRoute('/blog/$slug')({
  staticData: { pageId: 'pg_bP7xNc3vJm6A', funnel: { next: [] } },
  loader: ({ params }) => {
    const post = POSTS.find((p) => p.slug === params.slug)
    if (!post) throw notFound()
    return {
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      words: getPostWordCount(post),
      minutes: getReadingMinutes(post),
    }
  },
  head: ({ loaderData }) => ({
    links: loaderData && import.meta.env.VITE_PUBLIC_SITE_URL
      ? [{ rel: 'canonical', href: new URL(`/blog/${loaderData.slug}`, import.meta.env.VITE_PUBLIC_SITE_URL).toString() }]
      : [],
    meta: loaderData
      ? [
          { title: `${loaderData.title} — PDF Pilot 5U Blog` },
          { name: 'description', content: loaderData.summary },
          { property: 'og:title', content: `${loaderData.title} — PDF Pilot 5U` },
          { property: 'og:description', content: loaderData.summary },
        ]
      : [],
  }),
  component: PostPage,
})

function PostPage() {
  const { slug } = Route.useParams()
  const post = POSTS.find((p) => p.slug === slug)!
  const wordCount = getPostWordCount(post)
  return (
    <PageShell
      eyebrow={`${post.date} · ${wordCount.toLocaleString()} words · ${getReadingMinutes(post)} min read`}
      title={post.title}
      intro={post.summary}
    >
      <div className="mb-8 grid gap-4 rounded-2xl border border-line bg-card p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
        <p className="leading-relaxed text-muted">{post.preview}</p>
        <p className="rounded-full bg-blush px-4 py-2 text-center text-xs font-semibold text-accent">Original PDF Pilot 5U guide</p>
      </div>
      <nav aria-label="Article contents" className="mb-10 rounded-2xl bg-blush p-5">
        <h2 className="font-display font-bold">In this guide</h2>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-relaxed">
          {post.sections.map((section, index) => (
            <li key={section.heading}>
              <a className="text-accent hover:underline" href={`#section-${index + 1}`}>
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <Prose>
        {post.sections.map((section, index) => (
          <section key={section.heading} id={`section-${index + 1}`} className="scroll-mt-24">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && (
              <ul>
                {section.bullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
            {section.steps && (
              <ol className="ms-5 list-decimal space-y-2">
                {section.steps.map((item) => <li key={item}>{item}</li>)}
              </ol>
            )}
          </section>
        ))}
      </Prose>
      <section className="mt-12 rounded-2xl border border-line bg-card p-6" aria-labelledby="related-tools-heading">
        <h2 id="related-tools-heading" className="font-display text-xl font-bold">Related PDF tools</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {post.relatedTools.map((tool) => (
            <li key={tool.slug}>
              <Link
                to="/tools/$slug"
                params={{ slug: tool.slug }}
                className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold text-accent transition hover:border-accent/40 hover:bg-blush"
              >
                {tool.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Link to="/blog" className="mt-12 inline-block font-semibold text-accent">
        ← All posts
      </Link>
    </PageShell>
  )
}
