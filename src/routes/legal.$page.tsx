import { createFileRoute, notFound } from '@tanstack/react-router'
import { PageShell, Prose } from '#/components/PageShell'

type LegalPage = { title: string; description: string; body: React.ReactNode }

const UPDATED = 'Last updated: November 22, 2026'

const PAGES: Record<string, LegalPage> = {
  privacy: {
    title: 'Privacy Policy',
    description: 'How PDFTools handles your files and data.',
    body: (
      <>
        <p>{UPDATED}</p>
        <h2>Your files</h2>
        <p>
          The PDF and image files you choose are processed inside your browser. They are not uploaded to PDFTools or to
          any other server. We never see, store or have access to their contents.
        </p>
        <h2>Stored in your browser</h2>
        <ul>
          <li>Your language and light/dark preference are saved in your browser’s local storage.</li>
          <li>
            Results you create are kept in “My Files” using your browser’s IndexedDB, on your device only. You can delete
            them on the My Files page or by clearing your browser data.
          </li>
        </ul>
        <h2>Site analytics</h2>
        <p>
          The platform that hosts this website may record standard, aggregate page-view information (such as pages
          visited and browser type). This never includes the contents of your files.
        </p>
        <h2>Changes</h2>
        <p>If this policy changes, the date above will be updated.</p>
      </>
    ),
  },
  terms: {
    title: 'Terms of Service',
    description: 'The terms for using PDFTools.',
    body: (
      <>
        <p>{UPDATED}</p>
        <h2>Using PDFTools</h2>
        <p>
          PDFTools is provided free of charge, as is. You may use it for personal and commercial documents. Only process
          files you have the right to use and modify.
        </p>
        <h2>Your responsibility</h2>
        <p>
          Because processing happens on your device, results depend on your browser and the file itself. Always keep
          your original file and check the result before relying on it.
        </p>
        <h2>No warranty</h2>
        <p>
          PDFTools is offered without warranty of any kind. To the extent allowed by law, we are not liable for loss of
          data or any damages arising from use of the tools.
        </p>
        <h2>Signatures</h2>
        <p>
          Sign PDF places an image of a signature on a page. It does not create a certificate-based digital signature.
        </p>
      </>
    ),
  },
  refund: {
    title: 'Refund Policy',
    description: 'PDFTools is free, so there are no payments to refund.',
    body: (
      <>
        <p>{UPDATED}</p>
        <p>
          PDFTools is free to use. We don’t sell plans, subscriptions or credits, and we never ask for payment details.
          Because no payments are taken, there is nothing to refund.
        </p>
        <p>If anyone asks you to pay for PDFTools, it isn’t us.</p>
      </>
    ),
  },
  cookies: {
    title: 'Cookie Policy',
    description: 'What PDFTools stores in your browser.',
    body: (
      <>
        <p>{UPDATED}</p>
        <p>PDFTools itself does not set advertising or tracking cookies. It stores a small amount of data in your browser:</p>
        <ul>
          <li>
            <strong>pdftools-lang</strong> (local storage): your chosen language, English or Urdu.
          </li>
          <li>
            <strong>pdftools-theme</strong> (local storage): light or dark mode.
          </li>
          <li>
            <strong>pdftools</strong> (IndexedDB): results listed in My Files.
          </li>
        </ul>
        <p>
          The hosting platform may use its own cookies or similar technology for basic page-view analytics. You can
          clear all of this at any time from your browser settings.
        </p>
      </>
    ),
  },
}

export const Route = createFileRoute('/legal/$page')({
  staticData: { pageId: 'pg_lG9sDf2kHw5M', funnel: { next: [] } },
  loader: ({ params }) => {
    const page = PAGES[params.page]
    if (!page) throw notFound()
    return { title: page.title, description: page.description }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.title} — PDFTools` }, { name: 'description', content: loaderData.description }]
      : [],
  }),
  component: Legal,
})

function Legal() {
  const { page } = Route.useParams()
  const data = PAGES[page]
  return (
    <PageShell eyebrow="Legal" title={data.title}>
      <Prose>{data.body}</Prose>
    </PageShell>
  )
}
