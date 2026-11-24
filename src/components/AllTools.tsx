import { useI18n } from '#/lib/i18n'
import { CATEGORIES, LISTED_TOOLS } from '#/lib/tools'
import { ToolCard } from './ToolCard'

export function AllTools() {
  const { t } = useI18n()
  return (
    <div className="space-y-14">
      {CATEGORIES.filter((cat) => LISTED_TOOLS.some((tool) => tool.category === cat)).map((cat) => {
        const tools = LISTED_TOOLS.filter((x) => x.category === cat)
        return (
          <div key={cat} id={`cat-${cat}`}>
            <div data-reveal className="mb-5 flex items-baseline gap-3 border-b border-line pb-3">
              <h3 className="font-display text-xl font-bold">{t(`cat.${cat}` as const)}</h3>
              <span className="text-sm text-muted tabular-nums">{tools.length}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tools.map((tool, i) => (
                <div key={tool.slug} data-reveal style={{ '--d': `${i * 70}ms` } as React.CSSProperties}>
                  <ToolCard tool={tool} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
