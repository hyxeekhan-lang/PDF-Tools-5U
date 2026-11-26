import { useI18n } from '#/lib/i18n'
import { CATEGORIES, LISTED_TOOLS } from '#/lib/tools'
import { ToolCard } from './ToolCard'

export function AllTools() {
  const { t } = useI18n()
  const newTools = LISTED_TOOLS.filter((tool) => tool.slug === 'image-compressor' || tool.slug === 'barcode-maker')
  const categorizedTools = LISTED_TOOLS.filter((tool) => !newTools.some((item) => item.slug === tool.slug))
  return (
    <div className="space-y-14">
      {newTools.length > 0 && (
        <section id="new-tools" aria-labelledby="new-tools-heading">
          <div data-reveal className="mb-5 flex items-baseline gap-3 border-b border-line pb-3">
            <h2 id="new-tools-heading" className="font-display text-xl font-bold text-accent">New tools</h2>
            <span className="text-sm text-muted tabular-nums">{newTools.length}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {newTools.map((tool, i) => (
              <div key={tool.slug} data-reveal style={{ '--d': `${i * 70}ms` } as React.CSSProperties}>
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        </section>
      )}
      {CATEGORIES.filter((cat) => categorizedTools.some((tool) => tool.category === cat)).map((cat) => {
        const tools = categorizedTools.filter((x) => x.category === cat)
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
