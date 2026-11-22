import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '#/lib/i18n'
import { searchTools } from '#/lib/tools'
import { ToolIcon } from './ToolCard'

export function ToolSearch({ className = '' }: { className?: string }) {
  const { t, pick } = useI18n()
  const [q, setQ] = useState('')
  const results = searchTools(q)
  return (
    <div className={`relative ${className}`}>
      <label className="flex min-h-12 items-center gap-3 rounded-full border border-line bg-card px-5 shadow-[var(--shadow-soft)] focus-within:border-accent/60">
        <Search className="size-5 shrink-0 text-muted" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('search.placeholder')}
          aria-label={t('search.placeholder')}
          className="w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-muted"
        />
      </label>
      {q.trim() && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-card border border-line bg-card p-2 text-start shadow-[var(--shadow-soft)]">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted">{t('search.none')}</p>
          ) : (
            results.map((tool) => (
              <Link
                key={tool.slug}
                to="/tools/$slug"
                params={{ slug: tool.slug }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-blush"
              >
                <ToolIcon tool={tool} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{pick(tool.name)}</span>
                  <span className="block truncate text-xs text-muted">{pick(tool.desc)}</span>
                </span>
                {tool.status === 'soon' && <span className="text-xs font-semibold text-muted">{t('tool.soon')}</span>}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
