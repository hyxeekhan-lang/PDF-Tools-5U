import { Link, createFileRoute } from '@tanstack/react-router'
import { PageShell, Prose } from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'

export const Route = createFileRoute('/about')({
  staticData: { pageId: 'pg_ab7Kq2mXr9Lt', funnel: { next: [] } },
  head: () => ({
    meta: [
      { title: 'About PDFTools — free PDF tools that run in your browser' },
      { name: 'description', content: 'Why PDFTools processes your PDFs in your browser instead of on a server.' },
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
      intro="PDFTools is a small set of free PDF tools built around one idea: everyday PDF jobs shouldn’t require sending your documents to someone else’s server."
    >
      <Prose>
        <p>
          Most online PDF tools upload your file, process it on a server and send it back. That works, but it means your
          contracts, IDs and bank statements pass through a machine you don’t control.
        </p>
        <p>
          Modern browsers are powerful enough to do much of that work themselves. PDFTools uses two open-source
          libraries, <strong>pdf-lib</strong> to edit PDFs and <strong>PDF.js</strong> to render pages, so merging,
          splitting, rotating, signing, numbering, watermarking and converting images all happen inside your browser tab.
        </p>
        <h2>What we don’t do</h2>
        <p>
          Some conversions, such as Word, Excel and PowerPoint to and from PDF, and protecting a PDF with a password, need
          engines that can’t run reliably in a browser today. Instead of faking them, we list them as “Coming soon”.
        </p>
        <h2>Free, without a catch</h2>
        <p>
          There is no account and no paid plan. You can start with any tool on the{' '}
          <Link to="/tools">tools page</Link>.
        </p>
      </Prose>
    </PageShell>
  )
}
