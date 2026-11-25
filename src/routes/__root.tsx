import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Footer } from '#/components/Footer'
import { Header } from '#/components/Header'
import { CookieNotice } from '#/components/CookieNotice'
import { InstallAppBanner } from '#/components/InstallAppButton'
import { I18nProvider, bootScript } from '#/lib/i18n'
import { usePageTransition, useScrollReveal } from '#/lib/motion'
import '#/lib/sentry'

import appCss from '../styles.css?url'

const installPromptScript = `window.addEventListener('beforeinstallprompt', function (event) {
  event.preventDefault();
  window.__pdfpilot5uInstallPrompt = event;
  window.dispatchEvent(new Event('pdfpilot5u-install-prompt'));
});
window.addEventListener('appinstalled', function () {
  window.__pdfpilot5uInstallPrompt = null;
  window.dispatchEvent(new Event('pdfpilot5u-install-prompt'));
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(function (error) {
    console.error('PDF Pilot 5U service worker registration failed.', error);
  });
}`

const FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Dancing+Script:wght@600&family=Great+Vibes&family=Caveat:wght@600&display=swap'

const SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://pdfpilot5u.vercel.app'
const SOCIAL_IMAGE = `${SITE_URL}/brand/social-preview.png`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'PDF Pilot 5U — Everything you need to work with PDFs' },
      { name: 'theme-color', content: '#D92D20' },
      { name: 'color-scheme', content: 'light dark' },
      { name: 'description', content: 'PDF Pilot 5U provides browser-based PDF tools to merge, split, compress, convert, edit, sign and organize PDF files.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'PDF Pilot 5U' },
      { property: 'og:title', content: 'PDF Pilot 5U — Free browser-based PDF tools' },
      { property: 'og:description', content: 'Merge, split, compress, convert, edit and sign PDF files directly in your browser.' },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:image', content: SOCIAL_IMAGE },
      { property: 'og:image:alt', content: 'PDF Pilot 5U PDF tools' },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'PDF Pilot 5U — Free browser-based PDF tools' },
      { name: 'twitter:description', content: 'Work with PDF files in your browser using PDF Pilot 5U.' },
      { name: 'twitter:image', content: SOCIAL_IMAGE },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: FONTS },
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'apple-touch-icon', href: '/brand/apple-touch-icon.png' },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: "/favicon.svg",
      },
    ],
    scripts: [{ children: bootScript }, { children: installPromptScript }],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PDF Pilot 5U',
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    description: 'Browser-based PDF tools to merge, split, compress, convert, edit and sign PDF files.',
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body className="bg-paper text-ink">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  useScrollReveal()
  const mainRef = usePageTransition<HTMLElement>()
  return (
    <I18nProvider>
      <div className="flex min-h-screen flex-col overflow-x-clip">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-full bg-accent px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" ref={mainRef} className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <CookieNotice />
        <InstallAppBanner />
      </div>
    </I18nProvider>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-28 text-center">
      <p className="font-display text-6xl font-extrabold text-accent">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">This page doesn’t exist</h1>
      <p className="mt-2 text-muted">The link may be old, or the address mistyped.</p>
      <Link to="/" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-accent px-7 font-semibold text-white hover:bg-accent-dark">
        Back to PDF Pilot 5U
      </Link>
    </div>
  )
}
