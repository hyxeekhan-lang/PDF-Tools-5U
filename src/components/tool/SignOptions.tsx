import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '#/lib/i18n'
import { type Bilingual, type PdfDoc, ToolError, openPdfjs, renderPage, signPdf, textToPng } from '#/lib/pdf'
import { Field, ProcessButton, Segmented, Slider, inputClass } from './controls'
import type { OptionsProps } from './options'

type Signature = { url: string; bytes: Uint8Array; aspect: number }

const FONTS = [
  { label: 'Dancing Script', css: '"Dancing Script", cursive' },
  { label: 'Great Vibes', css: '"Great Vibes", cursive' },
  { label: 'Caveat', css: '"Caveat", cursive' },
]
const INKS = ['#101828', '#1D4ED8', '#D92D20']

function trimCanvas(src: HTMLCanvasElement): HTMLCanvasElement | null {
  const ctx = src.getContext('2d')!
  const { width, height } = src
  const data = ctx.getImageData(0, 0, width, height).data
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
  if (maxX < 0) return null
  const pad = 6
  const out = document.createElement('canvas')
  out.width = maxX - minX + 1 + pad * 2
  out.height = maxY - minY + 1 + pad * 2
  out.getContext('2d')!.drawImage(src, minX - pad, minY - pad, out.width, out.height, 0, 0, out.width, out.height)
  return out
}

async function canvasToSignature(canvas: HTMLCanvasElement): Promise<Signature> {
  const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/png'))
  const bytes = new Uint8Array(await blob.arrayBuffer())
  return { url: URL.createObjectURL(blob), bytes, aspect: canvas.width / canvas.height }
}

function DrawPad({ ink, onChange }: { ink: string; onChange: (s: Signature | null) => void }) {
  const { tr } = useI18n()
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const c = ref.current!
    const dpr = window.devicePixelRatio || 1
    c.width = c.clientWidth * dpr
    c.height = c.clientHeight * dpr
  }, [])

  const point = (e: React.PointerEvent) => {
    const c = ref.current!
    const r = c.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height }
  }

  const finish = async () => {
    if (!drawing.current) return
    drawing.current = false
    last.current = null
    const trimmed = trimCanvas(ref.current!)
    onChange(trimmed ? await canvasToSignature(trimmed) : null)
  }

  return (
    <div>
      <canvas
        ref={ref}
        className="h-44 w-full touch-none rounded-xl border-2 border-dashed border-accent/40 bg-white"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          drawing.current = true
          last.current = point(e)
        }}
        onPointerMove={(e) => {
          if (!drawing.current || !last.current) return
          const ctx = ref.current!.getContext('2d')!
          const p = point(e)
          ctx.strokeStyle = ink
          ctx.lineWidth = 2.6 * (window.devicePixelRatio || 1)
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.beginPath()
          ctx.moveTo(last.current.x, last.current.y)
          ctx.lineTo(p.x, p.y)
          ctx.stroke()
          last.current = p
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
        aria-label={tr('Signature drawing area', 'دستخط بنانے کی جگہ')}
      />
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-muted">{tr('Sign with your mouse, finger or stylus.', 'ماؤس، انگلی یا اسٹائلس سے دستخط کریں۔')}</span>
        <button
          type="button"
          className="min-h-9 rounded-full border border-line px-3 font-medium hover:border-accent"
          onClick={() => {
            const c = ref.current!
            c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
            onChange(null)
          }}
        >
          {tr('Clear', 'صاف کریں')}
        </button>
      </div>
    </div>
  )
}

function usePagePreview(file: File, index: number) {
  const [doc, setDoc] = useState<PdfDoc | null>(null)
  const [error, setError] = useState<Bilingual | null>(null)
  const [preview, setPreview] = useState<{ url: string; aspect: number } | null>(null)

  useEffect(() => {
    let pdf: PdfDoc | null = null
    let cancelled = false
    openPdfjs(file)
      .then((d) => {
        pdf = d
        if (cancelled) d.destroy()
        else setDoc(d)
      })
      .catch((e) => setError(e instanceof ToolError ? e.text : { en: 'Couldn’t preview this PDF.', ur: 'پیش منظر نہیں بن سکا۔' }))
    return () => {
      cancelled = true
      pdf?.destroy()
    }
  }, [file])

  useEffect(() => {
    if (!doc) return
    let cancelled = false
    setPreview(null)
    ;(async () => {
      const page = await doc.getPage(index + 1)
      const base = page.getViewport({ scale: 1 })
      const { canvas, viewport } = await renderPage(page, 1400 / Math.max(base.width, base.height))
      const url = canvas.toDataURL('image/jpeg', 0.85)
      canvas.width = 0
      if (!cancelled) setPreview({ url, aspect: viewport.width / viewport.height })
    })()
    return () => {
      cancelled = true
    }
  }, [doc, index])

  return { count: doc?.numPages ?? 0, preview, error }
}

export function SignOptions({ files, run }: OptionsProps) {
  const { tr, pick } = useI18n()
  const file = files[0]
  const [mode, setMode] = useState<'draw' | 'type'>('draw')
  const [ink, setInk] = useState(INKS[0])
  const [drawn, setDrawn] = useState<Signature | null>(null)
  const [typed, setTyped] = useState<Signature | null>(null)
  const [name, setName] = useState('')
  const [font, setFont] = useState(FONTS[0].css)
  const [pageIndex, setPageIndex] = useState(0)
  const [width, setWidth] = useState(0.3)
  const [pos, setPos] = useState({ left: 0.6, top: 0.8 })
  const stage = useRef<HTMLDivElement>(null)
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const { count, preview, error } = usePagePreview(file, pageIndex)

  useEffect(() => {
    if (mode !== 'type' || !name.trim()) {
      setTyped(null)
      return
    }
    let cancelled = false
    const id = setTimeout(async () => {
      const png = await textToPng(name, { font, color: ink, size: 120 })
      const blob = new Blob([png.bytes as BlobPart], { type: 'image/png' })
      if (!cancelled) setTyped({ url: URL.createObjectURL(blob), bytes: png.bytes, aspect: png.width / png.height })
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [mode, name, font, ink])

  const sig = mode === 'draw' ? drawn : typed
  const height = sig && preview ? (width / sig.aspect) * preview.aspect : 0.1

  const clamp = (left: number, top: number) => ({
    left: Math.min(Math.max(0, left), 1 - width),
    top: Math.min(Math.max(0, top), 1 - height),
  })

  useEffect(() => setPos((p) => clamp(p.left, p.top)), [width, height])

  const frac = (e: React.PointerEvent) => {
    const r = stage.current!.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded-xl bg-blush px-4 py-3 text-sm font-medium text-accent-dark">{pick(error)}</p>}
      <Field label={tr('1. Create your signature', '1. اپنے دستخط بنائیں')}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: 'draw', label: tr('Draw', 'بنائیں') },
                { value: 'type', label: tr('Type', 'ٹائپ کریں') },
              ]}
            />
            <div className="flex gap-2">
              {INKS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  aria-pressed={ink === c}
                  onClick={() => setInk(c)}
                  className={`size-8 rounded-full ring-offset-2 ring-offset-card ${ink === c ? 'ring-2 ring-accent' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          {mode === 'draw' ? (
            <DrawPad ink={ink} onChange={setDrawn} />
          ) : (
            <div className="space-y-3">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder={tr('Type your name', 'اپنا نام لکھیں')} autoComplete="name" />
              <div className="grid gap-2 sm:grid-cols-3">
                {FONTS.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    aria-pressed={font === f.css}
                    onClick={() => setFont(f.css)}
                    className={`min-h-14 truncate rounded-xl border bg-white px-3 text-2xl text-[#101828] ${font === f.css ? 'border-accent ring-1 ring-accent' : 'border-line'}`}
                    style={{ fontFamily: f.css }}
                  >
                    {name || f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Field>

      <Field label={tr('2. Place it on the page', '2. صفحے پر لگائیں')} hint={tr('Drag the signature to move it.', 'دستخط کو گھسیٹ کر منتقل کریں۔')}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2" dir="ltr">
              <button
                type="button"
                aria-label={tr('Previous page', 'پچھلا صفحہ')}
                disabled={pageIndex === 0}
                onClick={() => setPageIndex((i) => i - 1)}
                className="grid size-10 place-items-center rounded-full border border-line disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="min-w-20 text-center text-sm font-semibold tabular-nums">
                {count ? `${pageIndex + 1} / ${count}` : '…'}
              </span>
              <button
                type="button"
                aria-label={tr('Next page', 'اگلا صفحہ')}
                disabled={pageIndex >= count - 1}
                onClick={() => setPageIndex((i) => i + 1)}
                className="grid size-10 place-items-center rounded-full border border-line disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="w-full max-w-60">
              <Slider value={width} onChange={setWidth} min={0.08} max={0.7} step={0.01} display={`${Math.round(width * 100)}%`} label={tr('Signature size', 'دستخط کا سائز')} />
            </div>
          </div>
          <div className="rounded-xl bg-paper p-3 ring-1 ring-line">
            {preview ? (
              <div
                ref={stage}
                dir="ltr"
                className="relative mx-auto w-full max-w-xl touch-none select-none"
                style={{ aspectRatio: preview.aspect }}
                onPointerMove={(e) => {
                  if (!drag.current) return
                  const f = frac(e)
                  setPos(clamp(f.x - drag.current.dx, f.y - drag.current.dy))
                }}
                onPointerUp={() => (drag.current = null)}
                onPointerCancel={() => (drag.current = null)}
              >
                <img src={preview.url} alt={tr(`Page ${pageIndex + 1}`, `صفحہ ${pageIndex + 1}`)} className="absolute inset-0 size-full rounded shadow-sm" draggable={false} />
                {sig && (
                  <img
                    src={sig.url}
                    alt={tr('Your signature', 'آپ کے دستخط')}
                    draggable={false}
                    className="absolute cursor-move rounded outline-2 outline-dashed outline-accent"
                    style={{ left: `${pos.left * 100}%`, top: `${pos.top * 100}%`, width: `${width * 100}%`, height: `${height * 100}%` }}
                    onPointerDown={(e) => {
                      stage.current!.setPointerCapture(e.pointerId)
                      const f = frac(e)
                      drag.current = { dx: f.x - pos.left, dy: f.y - pos.top }
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="grid h-64 place-items-center">
                <Loader2 className="size-6 animate-spin text-muted" />
              </div>
            )}
          </div>
          {!sig && <p className="text-sm text-muted">{tr('Create a signature above to place it.', 'لگانے کے لیے پہلے اوپر دستخط بنائیں۔')}</p>}
        </div>
      </Field>

      <ProcessButton
        disabled={!sig || !preview}
        onClick={() =>
          sig && run((p) => signPdf(file, sig.bytes, { pageIndex, left: pos.left, top: pos.top, width, height }, p))
        }
        label={tr('Sign PDF', 'دستخط کریں')}
      />
    </div>
  )
}
