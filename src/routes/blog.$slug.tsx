import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { PageShell, Prose } from '#/components/PageShell'
import { POSTS } from '#/lib/blog'

export const Route = createFileRoute('/blog/$slug')({
  staticData: { pageId: 'pg_bP7xNc3vJm6A', funnel: { next: [] } },
  loader: ({ params }) => {
    const post = POSTS.find((p) => p.slug === params.slug)
    if (!post) throw notFound()
    return { title: post.title, summary: post.summary }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.title} — PDFTools Blog` }, { name: 'description', content: loaderData.summary }]
      : [],
  }),
  component: PostPage,
})

function PostPage() {
  const { slug } = Route.useParams()
  const post = POSTS.find((p) => p.slug === slug)!
  return (
    <PageShell eyebrow={post.date} title={post.title} intro={post.summary}>
      <Prose>{post.body}</Prose>
      <Link to="/blog" className="mt-12 inline-block font-semibold text-accent">
        ← All posts
      </Link>
    </PageShell>
  )
}
