import { createFileRoute, notFound } from '@tanstack/react-router'
import { PageShell, Prose } from '#/components/PageShell'
import { openCookieSettings } from '#/lib/cookie-consent'

type LegalPage = { title: string; description: string; body: React.ReactNode }

const UPDATED = 'Last updated: November 24, 2026'

const PAGES: Record<string, LegalPage> = {
  privacy: {
    title: 'Privacy Policy',
    description: 'How PDF Pilot 5U handles your files and data.',
    body: (
      <>
        <p>{UPDATED}</p>
        <h2>Your files</h2>
        <p>
          Most PDF tools process files inside your browser. PDF Pilot 5U does not receive or store the source files used with
          those tools. Generated results may be kept in this browser’s IndexedDB on the My Files page until you delete
          them or clear browser storage.
        </p>
        <h2>Accounts and processing history</h2>
        <p>
          If you create an account or sign in, Neon Auth processes your email address and account information. When a
          signed-in user completes a local tool, PDF Pilot 5U may store the tool name, input and output counts, output size
          and timestamp as processing history. PDF contents are not included in that history. Authentication sessions
          are managed by Neon Auth. AI requests do not create an account or anonymous session; the AI endpoint uses a
          per-IP rate limit. Standard hosting and security logs may also contain request IP information.
        </p>
        <h2>AI document tools</h2>
        <p>
          AI tools require separate, explicit consent before sending extracted selectable text from your document to
          Google Gemini, but do not require a registered account. The PDF itself is not uploaded by these tools. Do not
          send confidential or sensitive information unless you are comfortable with Google’s applicable terms and
          privacy practices. AI providers may process submitted text according to their own policies.
        </p>
        <h2>Stored in your browser</h2>
        <ul>
          <li>Your language and light/dark preference are saved in your browser’s local storage.</li>
          <li>
            Results you create may be kept in “My Files” using your browser’s IndexedDB, on your device only. You can
            delete them on the My Files page or by clearing your browser data.
          </li>
        </ul>
        <h2>Hosting and security</h2>
        <p>
          Our hosting and infrastructure providers may process standard request information, such as IP address,
          browser, requested URL and security logs, to deliver and protect the website. These logs do not include
          locally processed file contents.
        </p>
        <h2>Advertising</h2>
        <p>
          PDF Pilot 5U may display clearly labelled third-party advertisements in the three reserved ad placements.
          Advertising scripts are loaded only after you choose “Accept all” in the cookie notice. The current placements
          are not Google AdSense units; Google AdSense will be enabled only after an approved publisher account and
          valid ad-slot IDs are configured. Availability and processing may also depend on the advertising provider.
        </p>
        <h2>Analytics</h2>
        <p>
          Firebase Analytics is optional and is initialized only when valid configuration is installed and you choose
          “Accept all” in the cookie notice.
          It may use analytics identifiers or cookies and process usage and device information under Google’s terms.
          Choosing “Accept only essential” or the close button keeps analytics disabled. You can change this choice
          from Privacy settings.
        </p>
        <h2>Your choices and contact</h2>
        <p>
          You can remove local results from My Files, clear browser storage, and sign out to remove the local
          authentication session. For questions or account-data requests, contact{' '}
          <a href="mailto:hyxeekhan@gmail.com">hyxeekhan@gmail.com</a>.
        </p>
        <h2>Changes</h2>
        <p>If this policy changes, the date above will be updated.</p>
      </>
    ),
  },
  terms: {
    title: 'Terms of Service',
    description: 'The terms for using PDF Pilot 5U.',
    body: (
      <>
        <p>{UPDATED}</p>
        <h2>Using PDF Pilot 5U</h2>
        <p>
          Local PDF tools are provided without charge, as is. You may use them for documents you have the right to
          access and modify. Account features require an account. Optional AI tools do not require a registered account,
          but they do require separate consent before selected document text is sent to Google Gemini. An account is not
          required; the AI endpoint applies a per-IP request limit.
        </p>
        <h2>Your responsibility</h2>
        <p>
          Because processing happens on your device, results depend on your browser and the file itself. Always keep
          your original file and check the result before relying on it.
        </p>
        <h2>No warranty</h2>
        <p>
          PDF Pilot 5U is offered without warranty of any kind. To the extent allowed by law, we are not liable for loss of
          data or any damages arising from use of the tools.
        </p>
        <h2>Signatures</h2>
        <p>
          Sign PDF places an image of a signature on a page. It does not create a certificate-based digital signature.
        </p>
        <h2>Third-party AI tools</h2>
        <p>
          AI document features are optional and require your explicit consent before extracted text is sent to Google
          Gemini. A registered account is not required; the AI endpoint applies a per-IP request limit. Review the result
          for accuracy and do not submit information you are not
          permitted to share with that provider.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to <a href="mailto:hyxeekhan@gmail.com">hyxeekhan@gmail.com</a>.
        </p>
      </>
    ),
  },
  removedPolicy: {
    title: 'Retired legal page',
    description: 'This retired legal page is no longer published.',
    body: (
      <>
        <p>{UPDATED}</p>
        <p>
          PDF Pilot 5U is free to use. We don’t sell plans, subscriptions or credits, and we never ask for payment details.
          This retired page is no longer published.
        </p>
        <p>If anyone asks you to pay for PDF Pilot 5U, it isn’t us.</p>
      </>
    ),
  },
  cookies: {
    title: 'Cookie Policy',
    description: 'What PDF Pilot 5U stores in your browser.',
    body: (
      <>
        <p>{UPDATED}</p>
        <p>
          PDF Pilot 5U loads optional analytics and advertising tags only after you choose “Accept all”; neither loads
          when you choose “Accept only essential” or close the notice. The app uses browser storage and essential
          authentication state as follows:
        </p>
        <ul>
          <li>
            <strong>pdfpilot5u-cookie-consent-v2</strong> (local storage): records whether you chose all optional analytics
            or essential storage only.
          </li>
          <li>
            <strong>pdftools-lang</strong> (local storage): your chosen language, English or Urdu.
          </li>
          <li>
            <strong>pdftools-theme</strong> (local storage): light or dark mode.
          </li>
          <li>
            <strong>pdftools</strong> (IndexedDB): results listed in My Files.
          </li>
          <li>
            Neon Auth session state: maintains account access when you sign in; storage is managed by Neon Auth.
          </li>
        </ul>
        <p>
          Hosting and security infrastructure may use essential request technology. Advertising providers may set or
          access their own identifiers after optional advertising is allowed; their policies also apply.
        </p>
        <h2 id="privacy-settings">Privacy settings</h2>
        <p>
          Your choice controls Firebase Analytics and optional advertising scripts and can be changed at any time using
          this control. These services may store identifiers or cookies only after you accept all. You can delete
          saved PDF results on the{' '}
          <a href="/my-files">My Files page</a> and clear local preferences or your signed-in session through your
          browser settings. This notice is a basic site preference control, not a certified consent management platform.
          A certified CMP may be required for some advertising regions and remains an external compliance setup item.
        </p>
        <button
          type="button"
          onClick={openCookieSettings}
          className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-accent/50"
        >
          Manage cookie preferences
        </button>
      </>
    ),
  },
}

export const Route = createFileRoute('/legal/$page')({
  staticData: { pageId: 'pg_lG9sDf2kHw5M', funnel: { next: [] } },
  loader: ({ params }) => {
    if (params.page === 'refund') throw notFound()
    const page = PAGES[params.page]
    if (!page) throw notFound()
    return { title: page.title, description: page.description }
  },
  head: ({ loaderData, params }) => ({
    links: loaderData && import.meta.env.VITE_PUBLIC_SITE_URL
      ? [{ rel: 'canonical', href: new URL(`/legal/${params.page}`, import.meta.env.VITE_PUBLIC_SITE_URL).toString() }]
      : [],
    meta: loaderData
      ? [{ title: `${loaderData.title} — PDF Pilot 5U` }, { name: 'description', content: loaderData.description }]
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
