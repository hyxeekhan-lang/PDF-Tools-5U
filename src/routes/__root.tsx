import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Footer } from '#/components/Footer'
import { Header } from '#/components/Header'
import { I18nProvider, bootScript } from '#/lib/i18n'
import { usePageTransition, useScrollReveal } from '#/lib/motion'

import appCss from '../styles.css?url'

const FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Dancing+Script:wght@600&family=Great+Vibes&family=Caveat:wght@600&display=swap'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'PDFTools — Free PDF tools that run in your browser' },
      { name: 'theme-color', content: '#F04438' },
      { name: 'color-scheme', content: 'light dark' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: FONTS },
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect x='4' y='2' width='24' height='28' rx='6' fill='%23F04438'/%3E%3Crect x='9' y='14' width='14' height='2.4' rx='1.2' fill='white'/%3E%3Crect x='9' y='19' width='10' height='2.4' rx='1.2' fill='white'/%3E%3Crect x='9' y='24' width='12' height='2.4' rx='1.2' fill='white'/%3E%3C/svg%3E",
      },
    ],
    scripts: [{ children: bootScript }],
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
        <Header />
        <main ref={mainRef} className="flex-1">
          <Outlet />
        </main>
        <Footer />
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
        Back to PDFTools
      </Link>
    </div>
  )
}
