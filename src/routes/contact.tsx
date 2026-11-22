import { Link, createFileRoute } from '@tanstack/react-router'
import { PageShell, Prose } from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'

export const Route = createFileRoute('/contact')({
  staticData: { pageId: 'pg_cT4nWz8pQe1V', funnel: { next: [] } },
  head: () => ({
    meta: [
      { title: 'Contact PDFTools' },
      { name: 'description', content: 'How to reach the people behind PDFTools.' },
    ],
  }),
  component: Contact,
})

function Contact() {
  const { t } = useI18n()
  return (
    <PageShell eyebrow={t('footer.contact')} title="Get in touch" intro="Questions, bug reports and tool requests are welcome.">
      <Prose>
        <p>
          Email: <strong>[confirm: support email address]</strong>
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
