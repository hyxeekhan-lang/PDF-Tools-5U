import { Link } from '@tanstack/react-router'
import { useI18n } from '#/lib/i18n'
import type { Tool } from '#/lib/tools'
import { PdfToolIcon, resolvePdfToolIconName } from './PdfToolIcon'

export function ToolIcon({ tool, size = 'md' }: { tool: Tool; size?: 'md' | 'lg' }) {
  const { pick } = useI18n()
  const iconSize = size === 'lg' ? 32 : 24
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-2xl bg-accent text-white shadow-sm ${
        size === 'lg' ? 'size-14' : 'size-12'
      }`}
    >
      <PdfToolIcon
        name={resolvePdfToolIconName(tool.slug)}
        size={iconSize}
        title={pick(tool.name)}
        className="shrink-0"
      />
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
      className={`group flex h-full items-start gap-4 rounded-card border border-line bg-card p-4 transition duration-300 ease-[var(--ease-out)] focus-visible:bg-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:flex-col sm:gap-0 sm:p-5 ${
        soon
          ? 'opacity-80 hover:opacity-100'
          : 'shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-ink/15 hover:bg-card hover:shadow-md active:translate-y-0 active:scale-[0.99]'
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
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent transition group-hover:gap-2 group-hover:text-accent-dark">
          Open tool <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  )
}
