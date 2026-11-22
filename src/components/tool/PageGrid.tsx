import { ArrowDown, ArrowUp, Check, Loader2, X } from 'lucide-react'
import { useI18n } from '#/lib/i18n'
import type { Thumbs } from './usePdfThumbs'

function Thumb({ src, rotate = 0, label }: { src: string | null; rotate?: number; label: string }) {
  return (
    <div className="grid aspect-[3/4] place-items-center overflow-hidden rounded-lg bg-paper">
      {src ? (
        <img
          src={src}
          alt={label}
          className="max-h-full max-w-full object-contain shadow-sm transition-transform"
          style={{ transform: `rotate(${rotate}deg)`, scale: rotate % 180 ? '0.75' : '1' }}
        />
      ) : (
        <Loader2 className="size-5 animate-spin text-muted" aria-hidden />
      )}
    </div>
  )
}

export function SelectGrid({
  thumbs,
  selected,
  onToggle,
  onSelectAll,
  onClear,
  variant = 'select',
  rotate = 0,
}: {
  thumbs: Thumbs
  selected: Set<number>
  onToggle: (i: number) => void
  onSelectAll: () => void
  onClear: () => void
  variant?: 'select' | 'delete'
  rotate?: number
}) {
  const { t } = useI18n()
  if (!thumbs.count) return <p className="text-sm text-muted">{t('page.loadingPages')}</p>
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold">
          {selected.size} / {thumbs.count} {t('page.selected')}
        </span>
        <button type="button" onClick={onSelectAll} className="min-h-9 rounded-full border border-line px-3 font-medium hover:border-accent">
          {t('page.selectAll')}
        </button>
        <button type="button" onClick={onClear} className="min-h-9 rounded-full border border-line px-3 font-medium hover:border-accent">
          {t('page.clear')}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {thumbs.thumbs.map((src, i) => {
          const on = selected.has(i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i)}
              aria-pressed={on}
              className={`relative rounded-xl border-2 bg-card p-1.5 text-start transition ${
                on ? 'border-accent' : 'border-line hover:border-accent/40'
              }`}
            >
              <div className={on && variant === 'delete' ? 'opacity-35' : ''}>
                <Thumb src={src} rotate={on ? rotate : 0} label={`${t('page.page')} ${i + 1}`} />
              </div>
              <span className="mt-1 block text-center text-xs font-medium text-muted">{i + 1}</span>
              {on && (
                <span className="absolute end-2 top-2 grid size-6 place-items-center rounded-full bg-accent text-white">
                  {variant === 'delete' ? <X className="size-3.5" /> : <Check className="size-3.5" />}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ReorderGrid({ thumbs, order, onChange }: { thumbs: Thumbs; order: number[]; onChange: (o: number[]) => void }) {
  const { t } = useI18n()
  if (!thumbs.count) return <p className="text-sm text-muted">{t('page.loadingPages')}</p>
  const move = (pos: number, dir: -1 | 1) => {
    const next = [...order]
    const target = pos + dir
    if (target < 0 || target >= next.length) return
    ;[next[pos], next[target]] = [next[target], next[pos]]
    onChange(next)
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {order.map((pageIndex, pos) => (
        <div key={pageIndex} className="rounded-xl border border-line bg-card p-1.5">
          <Thumb src={thumbs.thumbs[pageIndex]} label={`${t('page.page')} ${pageIndex + 1}`} />
          <div className="mt-1.5 flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => move(pos, -1)}
              disabled={pos === 0}
              aria-label={`${t('page.moveUp')}: ${t('page.page')} ${pageIndex + 1}`}
              className="grid size-9 place-items-center rounded-lg border border-line hover:border-accent hover:text-accent disabled:opacity-30"
            >
              <ArrowUp className="size-4" />
            </button>
            <span className="text-xs font-semibold tabular-nums">
              {pos + 1}
              {pageIndex !== pos && <span className="font-normal text-muted"> ({pageIndex + 1})</span>}
            </span>
            <button
              type="button"
              onClick={() => move(pos, 1)}
              disabled={pos === order.length - 1}
              aria-label={`${t('page.moveDown')}: ${t('page.page')} ${pageIndex + 1}`}
              className="grid size-9 place-items-center rounded-lg border border-line hover:border-accent hover:text-accent disabled:opacity-30"
            >
              <ArrowDown className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
