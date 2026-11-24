import { Link, createFileRoute } from '@tanstack/react-router'
import { PageShell, Prose } from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'

export const Route = createFileRoute('/about')({
  staticData: { pageId: 'pg_ab7Kq2mXr9Lt', funnel: { next: [] } },
  head: () => ({
    links: import.meta.env.VITE_PUBLIC_SITE_URL
      ? [{ rel: 'canonical', href: new URL('/about', import.meta.env.VITE_PUBLIC_SITE_URL).toString() }]
      : [],
    meta: [
      { title: 'About PDF Pilot 5U — secure PDF tools that run in your browser' },
      { name: 'description', content: 'Why PDF Pilot 5U processes your PDFs in your browser instead of on a server.' },
    ],
  }),
  component: About,
})

function About() {
  const { t } = useI18n()
  return (
    <PageShell
      eyebrow={t('footer.about')}
      title="PDF tools that don’t need your files"
      intro="PDF Pilot 5U is a browser-based PDF workspace built around one idea: everyday PDF jobs should not require uploading your documents."
    >
      <Prose>
        <p>
          Most online PDF tools upload your file, process it on a server and send it back. That works, but it means your
          contracts, IDs and bank statements pass through a machine you don’t control.
        </p>
        <p>
          Most tools run locally in your browser. Account features and guest sessions use Supabase, and optional AI
          document tools send extracted text to Google Gemini only after you give explicit consent. AI tools do not
          require a registered account. Modern browsers are powerful enough to
          do much of the remaining work themselves. PDF Pilot 5U uses open-source
          libraries, <strong>pdf-lib</strong> to edit PDFs and <strong>PDF.js</strong> to render pages, so merging,
          splitting, rotating, signing, numbering, watermarking and converting images all happen inside your browser tab.
        </p>
        <h2>What we don’t do</h2>
        <p>
          Some specialized features—such as PDF/A conversion and certificate-backed digital signatures—need engines or
          credentials that are not configured. They are marked “Coming soon” rather than presented as working.
        </p>
        <h2>Free, without a catch</h2>
        <p>
          There is no paid plan. You can use local PDF tools and AI document tools without a registered account;
          sign-in is optional for account features. Start on the{' '}
          <Link to="/tools">tools page</Link>.
        </p>
      </Prose>
    </PageShell>
  )
}
