import { Link } from '@tanstack/react-router'
import { useI18n } from '#/lib/i18n'
import { openCookieSettings } from '#/lib/cookie-consent'
import { POPULAR, getTool } from '#/lib/tools'
import { Logo } from './Logo'
import { InstallAppButton } from './InstallAppButton'

export function Footer() {
  const { t, pick } = useI18n()
  const link = 'text-muted transition hover:text-accent'
  return (
    <footer aria-label="Site information" className="border-t border-line bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t('footer.tagline')}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">{t('footer.tools')}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {POPULAR.map((slug) => {
              const tool = getTool(slug)!
              return (
                <li key={slug}>
                  <Link to="/tools/$slug" params={{ slug }} className={link}>
                    {pick(tool.name)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">{t('footer.company')}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/about" className={link}>
                {t('footer.about')}
              </Link>
            </li>
            <li>
              <Link to="/contact" className={link}>
                {t('footer.contact')}
              </Link>
            </li>
            <li>
              <Link to="/help" className={link}>
                {t('footer.help')}
              </Link>
            </li>
            <li>
              <Link to="/help" className={link}>
                {t('footer.faq')}
              </Link>
            </li>
            <li>
              <Link to="/blog" className={link}>
                {t('footer.blog')}
              </Link>
            </li>
            <li>
              <InstallAppButton className={link} />
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">{t('footer.legal')}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/legal/$page" params={{ page: 'privacy' }} className={link}>
                {t('footer.privacy')}
              </Link>
            </li>
            <li>
              <Link to="/legal/$page" params={{ page: 'terms' }} className={link}>
                {t('footer.terms')}
              </Link>
            </li>
            <li>
              <Link to="/legal/$page" params={{ page: 'cookies' }} className={link}>
                {t('footer.cookies')}
              </Link>
            </li>
            <li>
              <Link to="/legal/$page" params={{ page: 'cookies' }} hash="privacy-settings" onClick={openCookieSettings} className={link}>
                {t('footer.privacySettings')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-xs text-muted sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} PDF Pilot 5U</p>
          <Link
            to="/"
            aria-label="PDF Pilot 5U home"
            className="inline-flex items-center gap-2 rounded-md transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <Logo />
          </Link>
        </div>
      </div>
    </footer>
  )
}
