import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Footer } from '#/components/Footer'
import { Header } from '#/components/Header'
import { CookieNotice } from '#/components/CookieNotice'
import { I18nProvider, bootScript } from '#/lib/i18n'
import { usePageTransition, useScrollReveal } from '#/lib/motion'

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

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'PDF Pilot 5U — Everything you need to work with PDFs' },
      { name: 'theme-color', content: '#D92D20' },
      { name: 'color-scheme', content: 'light dark' },
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
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
