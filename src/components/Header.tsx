import { Link } from '@tanstack/react-router'
import { ChevronDown, FolderOpen, Menu, Moon, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useI18n, useTheme } from '#/lib/i18n'
import { CATEGORIES, TOOLS } from '#/lib/tools'
import { Logo } from './Logo'

export function Header() {
  const { t, lang, setLang, pick } = useI18n()
  const { dark, toggle } = useTheme()
  const [toolsOpen, setToolsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setToolsOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (setToolsOpen(false), setMobileOpen(false))
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const close = () => {
    setToolsOpen(false)
    setMobileOpen(false)
  }

  const navLink = 'rounded-lg px-3 py-2 text-[15px] font-medium text-muted transition hover:bg-blush hover:text-ink'

  const LangSwitch = (
    <div className="flex rounded-full border border-line bg-card p-0.5 text-xs font-semibold" role="group" aria-label={t('nav.language')}>
      {(['en', 'ur'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`min-h-8 rounded-full px-2.5 transition ${lang === l ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
        >
          {l === 'en' ? 'EN' : 'اردو'}
        </button>
      ))}
    </div>
  )

  const ThemeButton = (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('nav.theme')}
      className="press grid size-10 place-items-center rounded-full border border-line bg-card text-muted hover:text-ink"
    >
      <span key={dark ? 'sun' : 'moon'} className="success-icon-swap grid place-items-center">
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </span>
    </button>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 lg:px-8">
        <Link to="/" onClick={close} aria-label="PDFTools home" className="shrink-0">
          <Logo />
        </Link>

        <nav className="ms-6 hidden items-center gap-0.5 lg:flex">
          <Link to="/" hash="features" className={navLink}>
            {t('nav.features')}
          </Link>
          <div className="relative" ref={dropRef}>
            <button
              type="button"
              className={`${navLink} inline-flex items-center gap-1`}
              aria-expanded={toolsOpen}
              onClick={() => setToolsOpen((o) => !o)}
            >
              {t('nav.tools')}
              <ChevronDown className={`size-4 transition ${toolsOpen ? 'rotate-180' : ''}`} />
            </button>
            {(
              <div
                inert={!toolsOpen}
                className={`absolute start-0 top-full mt-2 grid w-[760px] origin-top grid-cols-5 gap-5 rounded-card border border-line bg-card p-5 shadow-[var(--shadow-soft)] transition-[opacity,transform,visibility] duration-200 ease-[var(--ease-out)] ${
                  toolsOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-1.5 scale-[0.98] opacity-0'
                }`}
              >
                {CATEGORIES.map((cat) => (
                  <div key={cat}>
                    <p className="mb-2 text-xs font-semibold tracking-wide text-accent uppercase">{t(`cat.${cat}` as const)}</p>
                    <ul className="space-y-0.5">
                      {TOOLS.filter((x) => x.category === cat).map((tool) => (
                        <li key={tool.slug}>
                          <Link
                            to="/tools/$slug"
                            params={{ slug: tool.slug }}
                            onClick={close}
                            className="flex items-center justify-between gap-2 rounded-md py-1 text-sm text-ink/85 hover:text-accent"
                          >
                            <span>{pick(tool.name)}</span>
                            {tool.status === 'soon' && <span className="size-1.5 shrink-0 rounded-full bg-muted/40" title={t('tool.soon')} />}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Link
                  to="/tools"
                  onClick={close}
                  className="col-span-5 border-t border-line pt-3 text-sm font-semibold text-accent hover:text-accent-dark"
                >
                  {t('nav.allTools')} →
                </Link>
              </div>
            )}
          </div>
          <Link to="/" hash="pricing" className={navLink}>
            {t('nav.pricing')}
          </Link>
          <Link to="/blog" className={navLink}>
            {t('nav.blog')}
          </Link>
          <Link to="/about" className={navLink}>
            {t('nav.about')}
          </Link>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            {LangSwitch}
            {ThemeButton}
          </div>
          <Link
            to="/my-files"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[15px] font-medium text-muted hover:text-ink lg:inline-flex"
          >
            <FolderOpen className="size-4" />
            {t('nav.myFiles')}
          </Link>
          <Link
            to="/"
            hash="upload"
            className="press hidden min-h-10 items-center rounded-full bg-accent px-5 text-[15px] font-semibold text-white shadow-sm hover:bg-accent-dark hover:shadow-md sm:inline-flex"
          >
            {t('nav.getStarted')}
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-line bg-card lg:hidden"
            aria-label={t('nav.menu')}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fade-down max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper px-5 pb-6 lg:hidden">
          <nav className="flex flex-col py-3 text-base font-medium">
            <Link to="/" hash="features" onClick={close} className="py-3">
              {t('nav.features')}
            </Link>
            <Link to="/tools" onClick={close} className="py-3">
              {t('nav.tools')}
            </Link>
            <Link to="/" hash="pricing" onClick={close} className="py-3">
              {t('nav.pricing')}
            </Link>
            <Link to="/blog" onClick={close} className="py-3">
              {t('nav.blog')}
            </Link>
            <Link to="/about" onClick={close} className="py-3">
              {t('nav.about')}
            </Link>
            <Link to="/my-files" onClick={close} className="py-3">
              {t('nav.myFiles')}
            </Link>
          </nav>
          <div className="flex items-center gap-3 border-t border-line pt-4">
            {LangSwitch}
            {ThemeButton}
          </div>
          <Link
            to="/"
            hash="upload"
            onClick={close}
            className="mt-4 flex min-h-12 items-center justify-center rounded-full bg-accent font-semibold text-white"
          >
            {t('nav.getStarted')}
          </Link>
        </div>
      )}
    </header>
  )
}
