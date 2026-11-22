import { Link } from '@tanstack/react-router'
import { useI18n } from '#/lib/i18n'
import type { Tool } from '#/lib/tools'

export function ToolIcon({ tool, size = 'md' }: { tool: Tool; size?: 'md' | 'lg' }) {
  const Icon = tool.icon
  const soon = tool.status === 'soon'
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl transition-transform duration-300 ease-[var(--ease-spring)] group-hover:-rotate-6 group-hover:scale-110 rtl:group-hover:rotate-6 ${
        size === 'lg' ? 'size-14' : 'size-11'
      } ${soon ? 'bg-ink/5 text-muted' : 'bg-blush text-accent group-hover:bg-accent group-hover:text-white'}`}
    >
      <Icon className={size === 'lg' ? 'size-7' : 'size-5'} aria-hidden />
    </span>
  )
}

export function ToolCard({ tool }: { tool: Tool }) {
  const { t, pick } = useI18n()
  const soon = tool.status === 'soon'
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      className={`group flex h-full items-start gap-4 rounded-card border border-line bg-card p-4 transition duration-300 ease-[var(--ease-out)] sm:flex-col sm:gap-0 sm:p-5 ${
        soon
          ? 'opacity-80 hover:opacity-100'
          : 'shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_40px_-18px_rgb(240_68_56/0.35)] active:translate-y-0 active:scale-[0.99]'
      }`}
    >
      <div className="flex shrink-0 items-start justify-between gap-3 sm:w-full">
        <ToolIcon tool={tool} />
        {soon && (
          <span className="hidden rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-muted sm:inline">{t('tool.soon')}</span>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-base font-bold sm:mt-4">
          {pick(tool.name)}
          {soon && <span className="ms-2 text-xs font-semibold text-muted sm:hidden">· {t('tool.soon')}</span>}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted sm:mt-1.5">{pick(tool.desc)}</p>
      </div>
    </Link>
  )
}
