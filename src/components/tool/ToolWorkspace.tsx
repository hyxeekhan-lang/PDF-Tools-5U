import { ArrowDown, ArrowUp, CloudUpload, Download, FileText, Image as ImageIcon, Plus, RotateCcw, ShieldCheck, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { saveFiles, takePendingFiles } from '#/lib/files-store'
import { useI18n } from '#/lib/i18n'
import { type Bilingual, type Output, ToolError, downloadBlob, formatBytes, validateFile, zipOutputs } from '#/lib/pdf'
import type { Tool } from '#/lib/tools'
import { DropFrame } from '../DropFrame'
import { SignOptions } from './SignOptions'
import {
  CompressOptions,
  DeleteOptions,
  ExtractOptions,
  type Job,
  JpgToPdfOptions,
  MergeOptions,
  type OptionsProps,
  PageNumberOptions,
  PdfToJpgOptions,
  ReorderOptions,
  RotateOptions,
  type RunOptions,
  SplitOptions,
  WatermarkOptions,
} from './options'

const OPTIONS: Record<string, (p: OptionsProps) => React.ReactNode> = {
  'merge-pdf': MergeOptions,
  'split-pdf': SplitOptions,
  'rotate-pdf': RotateOptions,
  'delete-pages': DeleteOptions,
  'extract-pages': ExtractOptions,
  'reorder-pages': ReorderOptions,
  'add-page-numbers': PageNumberOptions,
  'add-watermark': WatermarkOptions,
  'sign-pdf': SignOptions,
  'jpg-to-pdf': JpgToPdfOptions,
  'pdf-to-jpg': PdfToJpgOptions,
  'compress-pdf': CompressOptions,
}

type State =
  | { phase: 'edit' }
  | { phase: 'processing'; fraction: number; label?: string }
  | { phase: 'done'; outputs: Output[]; compareSize?: number; saved: boolean }

export function ToolWorkspace({ tool }: { tool: Tool }) {
  const { t, tr, pick } = useI18n()
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Bilingual[]>([])
  const [state, setState] = useState<State>({ phase: 'edit' })
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const accept = tool.accepts === 'pdf' ? 'application/pdf,.pdf' : 'image/jpeg,image/png,.jpg,.jpeg,.png'

  const addFiles = useCallback(
    async (incoming: File[]) => {
      if (!incoming.length) return
      const list = tool.multiple ? incoming : incoming.slice(0, 1)
      const ok: File[] = []
      const bad: Bilingual[] = []
      for (const f of list) {
        try {
          await validateFile(f, tool.accepts)
          ok.push(f)
        } catch (e) {
          bad.push(e instanceof ToolError ? e.text : { en: `Couldn’t read “${f.name}”.`, ur: `“${f.name}” پڑھی نہیں جا سکی۔` })
        }
      }
      if (!tool.multiple && incoming.length > 1)
        bad.push({ en: 'This tool works on one file at a time. Only the first was used.', ur: 'یہ ٹول ایک وقت میں ایک فائل لیتا ہے۔ صرف پہلی فائل لی گئی۔' })
      setErrors(bad)
      if (ok.length) {
        setState({ phase: 'edit' })
        setFiles((prev) => (tool.multiple ? [...prev, ...ok] : ok))
      }
    },
    [tool],
  )

  useEffect(() => {
    const pending = takePendingFiles()
    if (pending.length) addFiles(pending)
  }, [addFiles])

  const run = useCallback(
    async (job: Job, opts: RunOptions = {}) => {
      setErrors([])
      setState({ phase: 'processing', fraction: 0 })
      try {
        let outputs = await job((fraction, label) => setState({ phase: 'processing', fraction: Math.min(fraction, 0.99), label }))
        if (opts.zipAs && outputs.length > 1) {
          setState({ phase: 'processing', fraction: 0.99, label: 'ZIP' })
          outputs = [await zipOutputs(outputs, opts.zipAs)]
        }
        const toSave = outputs.length > 5 ? [await zipOutputs(outputs, `${tool.slug}-results.zip`)] : outputs
        const saved = await saveFiles(toSave, tool.slug)
        setState({ phase: 'done', outputs, compareSize: opts.compareSize, saved })
      } catch (e) {
        console.error(e)
        setErrors([
          e instanceof ToolError
            ? e.text
            : {
                en: 'Something went wrong while processing this file. It may be damaged or too large for this device.',
                ur: 'فائل پروسیس کرتے ہوئے مسئلہ ہوا۔ فائل خراب یا اس آلے کے لیے بہت بڑی ہو سکتی ہے۔',
              },
        ])
        setState({ phase: 'edit' })
      }
    },
    [tool.slug],
  )

  const reset = () => {
    setFiles([])
    setErrors([])
    setState({ phase: 'edit' })
  }

  const move = (i: number, dir: -1 | 1) =>
    setFiles((prev) => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const Options = OPTIONS[tool.slug]
  const FileIcon = tool.accepts === 'pdf' ? FileText : ImageIcon

  const picker = (
    <input
      ref={inputRef}
      type="file"
      hidden
      accept={accept}
      multiple={tool.multiple}
      onChange={(e) => {
        addFiles(Array.from(e.target.files ?? []))
        e.target.value = ''
      }}
    />
  )

  const errorList = errors.length > 0 && (
    <div role="alert" className="space-y-1 rounded-xl border border-accent/30 bg-blush px-4 py-3 text-sm font-medium text-accent-dark">
      {errors.map((e, i) => (
        <p key={i}>{pick(e)}</p>
      ))}
    </div>
  )

  const renderResults = (state: Extract<State, { phase: 'done' }>) => {
    const total = state.outputs.reduce((n, o) => n + o.blob.size, 0)
    return (
      <div className="animate-fade-up rounded-card border border-line bg-card p-6 shadow-[var(--shadow-soft)] md:p-8">
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 28 28" className="success-pop mt-0.5 size-8 shrink-0 text-[#12B76A]" aria-hidden>
            <circle cx="14" cy="14" r="12" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="2.2" transform="rotate(-90 14 14)" />
            <path d="M8.5 14.5l3.6 3.6 7.4-7.6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <h2 className="font-display text-xl font-bold">{state.outputs.length > 1 ? t('page.doneMany') : t('page.done')}</h2>
            <p className="mt-1 text-sm text-muted">
              {t('page.localNote')} {state.saved && t('page.savedToMyFiles')}
            </p>
          </div>
        </div>
        {state.compareSize !== undefined && (
          <div className="mt-5 rounded-xl bg-paper px-4 py-3 text-sm" dir="ltr">
            <span className="font-semibold">{formatBytes(state.compareSize)}</span> → <span className="font-semibold">{formatBytes(total)}</span>{' '}
            {total < state.compareSize ? (
              <span className="font-semibold text-[#12B76A]">(−{Math.round((1 - total / state.compareSize) * 100)}%)</span>
            ) : (
              <span className="font-semibold text-accent-dark">
                (+{Math.round((total / state.compareSize - 1) * 100)}%)
              </span>
            )}
            {total >= state.compareSize && (
              <p className="mt-1 text-muted" dir="auto">
                {tr(
                  'The result is not smaller than your original. Try “Strong”, or keep the original file.',
                  'نتیجہ اصل فائل سے چھوٹا نہیں۔ “زیادہ” آزمائیں یا اصل فائل رکھیں۔',
                )}
              </p>
            )}
          </div>
        )}
        <ul className="mt-6 max-h-96 divide-y divide-line overflow-y-auto rounded-xl border border-line">
          {state.outputs.map((o, i) => (
            <li
              key={o.name}
              className="animate-fade-up flex items-center gap-3 px-4 py-3"
              style={{ '--d': `${250 + Math.min(i, 12) * 50}ms` } as React.CSSProperties}
            >
              <FileText className="size-5 shrink-0 text-accent" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium" dir="ltr">
                {o.name}
              </span>
              <span className="text-xs text-muted" dir="ltr">
                {formatBytes(o.blob.size)}
              </span>
              <button
                type="button"
                onClick={() => downloadBlob(o)}
                className="press inline-flex min-h-10 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-dark hover:shadow-md"
              >
                <Download className="size-4" />
                {t('page.download')}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          {state.outputs.length > 1 && (
            <button
              type="button"
              onClick={async () => downloadBlob(await zipOutputs(state.outputs, `${tool.slug}-results.zip`))}
              className="press inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper"
            >
              <Download className="size-4" />
              {t('page.downloadAll')}
            </button>
          )}
          <button
            type="button"
            onClick={() => setState({ phase: 'edit' })}
            className="press inline-flex min-h-12 items-center gap-2 rounded-full border border-line px-6 font-semibold hover:border-accent"
          >
            {tr('Change options', 'اختیارات بدلیں')}
          </button>
          <button type="button" onClick={reset} className="press group inline-flex min-h-12 items-center gap-2 rounded-full border border-line px-6 font-semibold hover:border-accent">
            <RotateCcw className="size-4 transition-transform duration-500 group-hover:-rotate-180" />
            {t('page.startOver')}
          </button>
        </div>
      </div>
    )
  }

  if (!files.length) {
    return (
      <div className="space-y-4">
        {picker}
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
            addFiles(Array.from(e.dataTransfer.files))
          }}
          className={`animate-fade-up relative rounded-card px-6 py-14 text-center transition-[background-color,transform] duration-300 md:py-20 ${
            dragging ? 'scale-[1.01] bg-blush' : 'bg-card'
          }`}
        >
          <DropFrame dragging={dragging} />
          <span className={`mx-auto grid size-16 place-items-center rounded-2xl bg-blush text-accent ${dragging ? 'is-dragging-icon' : ''}`}>
            <CloudUpload className="size-8" />
          </span>
          <p className="mt-5 font-display text-xl font-bold">{tool.multiple ? t('page.dropHereMany') : t('page.dropHere')}</p>
          <p className="mt-1 text-sm text-muted">
            {tool.accepts === 'pdf' ? 'PDF' : 'JPG, PNG'} · {t('page.limit')}
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="press relative mt-6 inline-flex min-h-12 items-center rounded-full bg-accent px-7 font-semibold text-white shadow-sm hover:bg-accent-dark hover:shadow-md"
          >
            {tool.multiple ? t('page.uploadMany') : t('page.upload')}
          </button>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="size-4 shrink-0 text-accent" />
            {t('page.localNote')}
          </p>
        </div>
        {errorList}
      </div>
    )
  }

  const processing = state.phase === 'processing'

  return (
    <div className="space-y-5">
      {picker}
      {state.phase === 'done' && renderResults(state)}
      <div className={`rounded-card border border-line bg-card p-4 shadow-[var(--shadow-soft)] ${state.phase === 'done' ? 'hidden' : ''}`}>
        <ul className="divide-y divide-line">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-3 py-2.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blush text-accent">
                <FileIcon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold" dir="ltr">
                  {f.name}
                </span>
                <span className="text-xs text-muted" dir="ltr">
                  {formatBytes(f.size)}
                </span>
              </span>
              {tool.multiple && files.length > 1 && (
                <>
                  <button type="button" disabled={i === 0 || processing} onClick={() => move(i, -1)} aria-label={t('page.moveUp')} className="grid size-9 place-items-center rounded-lg border border-line disabled:opacity-30">
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" disabled={i === files.length - 1 || processing} onClick={() => move(i, 1)} aria-label={t('page.moveDown')} className="grid size-9 place-items-center rounded-lg border border-line disabled:opacity-30">
                    <ArrowDown className="size-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={processing}
                onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                aria-label={`${t('page.remove')} ${f.name}`}
                className="grid size-9 place-items-center rounded-lg border border-line text-muted hover:text-accent disabled:opacity-30"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        {tool.multiple && (
          <button
            type="button"
            disabled={processing}
            onClick={() => inputRef.current?.click()}
            className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-accent hover:bg-blush"
          >
            <Plus className="size-4" />
            {t('page.addMore')}
          </button>
        )}
      </div>

      {errorList}

      {state.phase === 'processing' && (
        <div className="animate-fade-up rounded-card border border-line bg-card p-6" aria-live="polite">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>
              {t('page.processing')} {state.label && <span className="font-normal text-muted" dir="ltr">{state.label}</span>}
            </span>
            <span className="tabular-nums" dir="ltr">
              {Math.round(state.fraction * 100)}%
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-blush" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(state.fraction * 100)}>
            <div
              className="progress-shimmer relative h-full origin-left overflow-hidden rounded-full bg-gradient-to-r from-accent to-accent-dark transition-transform duration-300 ease-[var(--ease-out)] rtl:origin-right rtl:bg-gradient-to-l"
              style={{ transform: `scaleX(${Math.max(0.03, state.fraction)})` }}
            />
          </div>
        </div>
      )}
      <div className={`rounded-card border border-line bg-card p-5 shadow-[var(--shadow-soft)] md:p-7 ${state.phase === 'edit' ? '' : 'hidden'}`}>
        <h2 className="mb-5 font-display text-lg font-bold">{t('page.options')}</h2>
        {Options && <Options files={files} run={run} />}
      </div>
    </div>
  )
}
