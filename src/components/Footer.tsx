import { Link } from '@tanstack/react-router'
import { useI18n } from '#/lib/i18n'
import { POPULAR, getTool } from '#/lib/tools'
import { Logo } from './Logo'

export function Footer() {
  const { t, pick } = useI18n()
  const link = 'text-muted transition hover:text-accent'
  return (
    <footer className="border-t border-line bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t('footer.tagline')}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">{t('footer.tools')}</p>
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
          <p className="text-sm font-semibold">{t('footer.company')}</p>
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
              <Link to="/blog" className={link}>
                {t('footer.blog')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">{t('footer.legal')}</p>
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
              <Link to="/legal/$page" params={{ page: 'refund' }} className={link}>
                {t('footer.refund')}
              </Link>
            </li>
            <li>
              <Link to="/legal/$page" params={{ page: 'cookies' }} className={link}>
                {t('footer.cookies')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-muted lg:px-8">© {new Date().getFullYear()} PDFTools</p>
      </div>
    </footer>
  )
}
