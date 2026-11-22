import { Link, useNavigate } from '@tanstack/react-router'
import { CloudUpload, ShieldCheck, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { setPendingFiles } from '#/lib/files-store'
import { useI18n } from '#/lib/i18n'
import { MAX_BYTES, detectKind, formatBytes } from '#/lib/pdf'
import { type Tool, toolsForFiles } from '#/lib/tools'
import { DropFrame } from './DropFrame'
import { ToolIcon } from './ToolCard'

export function HeroUpload() {
  const { t, pick } = useI18n()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [picked, setPicked] = useState<{ files: File[]; kind: 'pdf' | 'image' } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handle = async (list: File[]) => {
    setError(null)
    if (!list.length) return
    const kinds = await Promise.all(list.map(detectKind))
    const first = kinds.findIndex((k) => k !== null)
    if (first < 0) return setError(t('hero.unsupported'))
    const kind = kinds[first] === 'pdf' ? 'pdf' : 'image'
    const files = list.filter((_, i) => kinds[i] !== null && (kinds[i] === 'pdf') === (kind === 'pdf'))
    if (files.some((f) => f.size > MAX_BYTES)) return setError(t('hero.tooBig'))
    setPicked({ files, kind })
  }

  const open = (tool: Tool) => {
    if (!picked) return
    setPendingFiles(tool.multiple ? picked.files : picked.files.slice(0, 1))
    navigate({ to: '/tools/$slug', params: { slug: tool.slug } })
  }

  return (
    <div id="upload" className="scroll-mt-24">
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept="application/pdf,.pdf,image/jpeg,image/png,.jpg,.jpeg,.png"
        onChange={(e) => {
          handle(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
      />
      {picked ? (
        <div
          className="animate-fade-up relative rounded-card bg-card p-5 text-start shadow-[var(--shadow-soft)] md:p-7"
          style={{ '--d': '0ms' } as React.CSSProperties}
        >
          <DropFrame dragging={false} />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-muted">{t('hero.picked')}</p>
              <p className="mt-0.5 truncate font-display text-lg font-bold" dir="ltr">
                {picked.files.length === 1 ? picked.files[0].name : `${picked.files.length} ${t('hero.pickedMany')}`}
                <span className="ms-2 text-sm font-normal text-muted">
                  {formatBytes(picked.files.reduce((n, f) => n + f.size, 0))}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPicked(null)}
              aria-label={t('hero.reset')}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-muted hover:text-accent"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {toolsForFiles(picked.kind).map((tool, i) => (
              <button
                key={tool.slug}
                type="button"
                onClick={() => open(tool)}
                style={{ '--d': `${80 + i * 45}ms` } as React.CSSProperties}
                className="animate-fade-up press group relative flex items-center gap-3 rounded-xl border border-line bg-paper p-3 text-start hover:border-accent/50 hover:bg-blush"
              >
                <ToolIcon tool={tool} />
                <span className="text-sm font-semibold">{pick(tool.name)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handle(Array.from(e.dataTransfer.files))
          }}
          className={`relative rounded-card px-6 py-12 shadow-[var(--shadow-soft)] transition-[background-color,transform] duration-300 md:py-16 ${
            dragging ? 'scale-[1.01] bg-blush' : 'bg-card'
          }`}
        >
          <DropFrame dragging={dragging} />
          <span
            className={`mx-auto grid size-16 place-items-center rounded-2xl bg-blush text-accent transition-transform duration-300 ${
              dragging ? 'is-dragging-icon' : ''
            }`}
          >
            <CloudUpload className="size-8" />
          </span>
          <p className="mt-5 font-display text-xl font-bold md:text-2xl">{t('hero.drop')}</p>
          <p className="mt-1.5 text-sm text-muted">{t('hero.formats')}</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="press relative mt-6 inline-flex min-h-12 items-center rounded-full bg-accent px-8 font-semibold text-white shadow-sm hover:bg-accent-dark hover:shadow-md"
          >
            {t('hero.choose')}
          </button>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="size-4 shrink-0 text-accent" />
            {t('hero.local')}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-accent-dark">
          {error}{' '}
          <Link to="/tools" className="underline">
            {t('nav.allTools')}
          </Link>
        </p>
      )}
    </div>
  )
}
