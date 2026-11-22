import { useI18n } from '#/lib/i18n'

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-paper p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-10 rounded-lg px-3.5 text-sm font-semibold transition duration-200 active:scale-[0.96] ${
            value === o.value ? 'bg-card text-accent shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  display,
  label,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  display: string
  label: string
}) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-[#F04438]"
      />
      <span className="w-16 shrink-0 text-end text-sm font-semibold tabular-nums" dir="ltr">
        {display}
      </span>
    </div>
  )
}

export const inputClass =
  'min-h-11 w-full rounded-xl border border-line bg-paper px-3.5 text-[15px] outline-none focus:border-accent/60'

export function ProcessButton({ onClick, disabled, label }: { onClick: () => void; disabled?: boolean; label?: string }) {
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="press inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-sm hover:bg-accent-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {label ?? t('page.process')}
    </button>
  )
}
