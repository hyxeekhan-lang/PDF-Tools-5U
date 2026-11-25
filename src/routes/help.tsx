import { Link, createFileRoute } from '@tanstack/react-router'
import { PageShell } from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'

export const Route = createFileRoute('/help')({
  staticData: { pageId: 'pg_hL3cVb6nYs0R', funnel: { next: [] } },
  head: () => ({
    links: import.meta.env.VITE_PUBLIC_SITE_URL
      ? [{ rel: 'canonical', href: new URL('/help', import.meta.env.VITE_PUBLIC_SITE_URL).toString() }]
      : [],
    meta: [
      { title: 'Help Center — PDF Pilot 5U' },
      { name: 'description', content: 'Answers to common questions about using PDF Pilot 5U in your browser.' },
    ],
  }),
  component: Help,
})

const TOPICS = [
  {
    q: 'A tool says my file is not a valid PDF',
    a: 'PDF Pilot 5U checks both the file type and the first bytes of the file, which must start with “%PDF”. Files renamed to .pdf, or downloads that were cut short, fail this check. Try opening the file in a PDF viewer and saving a fresh copy.',
  },
  {
    q: 'A tool says my PDF is password-protected',
    a: 'Use Unlock PDF with the password you already know, then process the unlocked copy. PDF Pilot 5U does not guess, crack or bypass unknown passwords.',
  },
  {
    q: 'Processing is slow or the tab crashes',
    a: 'Everything runs on your device, so very large files (hundreds of pages, or high-resolution scans) depend on your device’s memory. Close other tabs, or use a lower DPI in Compress PDF and PDF to JPG.',
  },
  {
    q: 'Compress PDF made my file bigger',
    a: 'Compression redraws pages as JPEG images. PDFs that are mostly text are often already small, and images of their pages can be larger. The tool shows the before and after size; if it didn’t help, keep your original.',
  },
  {
    q: 'Where did my file go after downloading?',
    a: 'It is saved wherever your browser stores downloads. Recent results are also kept in My Files in this browser until you clear them.',
  },
  {
    q: 'Is a signature from Sign PDF legally binding?',
    a: 'Sign PDF adds a visible image of your signature. It is not a certificate-based digital signature. Whether that is enough depends on the document and where you are; check with the person asking for the signature.',
  },
  {
    q: 'Does PDF Pilot 5U upload my documents?',
    a: 'Local PDF tools process files in your browser. If you choose an AI tool, selectable text is sent to Google Gemini only after you explicitly consent; the source PDF is not uploaded. AI works without an account; requests are rate-limited by IP. Avoid sending confidential material to AI services.',
  },
  {
    q: 'Why can’t I find PDF/A or a certificate-backed signature?',
    a: 'PDF/A conversion and certificate-backed digital signatures need specialized engines or credentials that are not configured, so they remain hidden until verified.',
  },
]

function Help() {
  const { t } = useI18n()
  return (
    <PageShell eyebrow={t('footer.help')} title="How can we help?" intro="Common questions about using PDF Pilot 5U.">
      <div className="divide-y divide-line border-y border-line">
        {TOPICS.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold">
              {item.q}
              <span className="text-2xl text-muted transition group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-10 text-muted">
        Still stuck?{' '}
        <Link to="/contact" className="font-semibold text-accent">
          Contact us
        </Link>
        .
      </p>
    </PageShell>
  )
}
