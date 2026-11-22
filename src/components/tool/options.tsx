import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '#/lib/i18n'
import {
  type NumberPosition,
  type Output,
  type Progress,
  ToolError,
  addPageNumbers,
  addWatermark,
  compressPdf,
  deletePages,
  extractPages,
  imagesToPdf,
  mergePdfs,
  parseRanges,
  pdfToJpg,
  reorderPages,
  rotatePdf,
  splitPdf,
} from '#/lib/pdf'
import { ReorderGrid, SelectGrid } from './PageGrid'
import { Field, ProcessButton, Segmented, Slider, inputClass } from './controls'
import { usePdfThumbs } from './usePdfThumbs'

export type Job = (onProgress: Progress) => Promise<Output[]>
export type RunOptions = { zipAs?: string; compareSize?: number }
export type OptionsProps = { files: File[]; run: (job: Job, opts?: RunOptions) => void }

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>
}

function ThumbError({ error }: { error: { en: string; ur: string } | null }) {
  const { pick } = useI18n()
  if (!error) return null
  return <p className="rounded-xl bg-blush px-4 py-3 text-sm font-medium text-accent-dark">{pick(error)}</p>
}

function useSelection(count: number) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  useEffect(() => setSelected(new Set()), [count])
  return {
    selected,
    toggle: (i: number) =>
      setSelected((s) => {
        const n = new Set(s)
        if (n.has(i)) n.delete(i)
        else n.add(i)
        return n
      }),
    all: () => setSelected(new Set(Array.from({ length: count }, (_, i) => i))),
    clear: () => setSelected(new Set()),
    set: setSelected,
  }
}

export function MergeOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">
        {tr(
          'Files are merged top to bottom in the order shown above. Use the arrows to change it.',
          'فائلیں اوپر دکھائی گئی ترتیب سے یکجا ہوں گی۔ ترتیب بدلنے کے لیے تیر استعمال کریں۔',
        )}
      </p>
      {files.length < 2 && (
        <p className="text-sm font-medium text-accent-dark">{tr('Add at least one more PDF.', 'کم از کم ایک اور پی ڈی ایف شامل کریں۔')}</p>
      )}
      <ProcessButton disabled={files.length < 2} onClick={() => run((p) => mergePdfs(files, p))} label={tr('Merge PDFs', 'یکجا کریں')} />
    </Panel>
  )
}

export function SplitOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const thumbs = usePdfThumbs(files[0], 120)
  const [mode, setMode] = useState<'ranges' | 'every'>('ranges')
  const [ranges, setRanges] = useState('')
  const [output, setOutput] = useState<'zip' | 'separate'>('zip')
  const preview = useMemo(() => {
    if (mode === 'every') return thumbs.count ? tr(`${thumbs.count} files, one per page`, `${thumbs.count} فائلیں، ہر صفحے کی ایک`) : ''
    if (!ranges.trim() || !thumbs.count) return ''
    try {
      const groups = parseRanges(ranges, thumbs.count)
      return tr(`${groups.length} file${groups.length === 1 ? '' : 's'} will be created`, `${groups.length} فائلیں بنیں گی`)
    } catch (e) {
      return e instanceof ToolError ? tr(e.text.en, e.text.ur) : ''
    }
  }, [mode, ranges, thumbs.count, tr])

  return (
    <Panel>
      <ThumbError error={thumbs.error} />
      <Field label={tr('Split mode', 'تقسیم کا طریقہ')}>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'ranges', label: tr('By page ranges', 'صفحات کی حد سے') },
            { value: 'every', label: tr('Every page', 'ہر صفحہ الگ') },
          ]}
        />
      </Field>
      {mode === 'ranges' && (
        <Field
          label={tr('Page ranges', 'صفحات کی حدود')}
          hint={tr(
            `Each comma-separated range becomes its own PDF. Example: 1-3, 4-6, 7-${thumbs.count || 'end'}`,
            `ہر حد الگ پی ڈی ایف بنے گی۔ مثال: 1-3, 4-6, 7-${thumbs.count || ''}`,
          )}
        >
          <input dir="ltr" className={inputClass} value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="1-3, 4-6, 7-" />
        </Field>
      )}
      <Field label={tr('Download as', 'ڈاؤن لوڈ کا طریقہ')}>
        <Segmented
          value={output}
          onChange={setOutput}
          options={[
            { value: 'zip', label: tr('One ZIP file', 'ایک ZIP فائل') },
            { value: 'separate', label: tr('Separate PDFs', 'الگ الگ پی ڈی ایف') },
          ]}
        />
      </Field>
      {preview && <p className="text-sm text-muted">{preview}{thumbs.count ? ` · ${thumbs.count} ${tr('pages in file', 'صفحات')}` : ''}</p>}
      <ProcessButton
        disabled={!thumbs.count || (mode === 'ranges' && !ranges.trim())}
        onClick={() =>
          run((p) => splitPdf(files[0], { mode, ranges }, p), {
            zipAs: output === 'zip' ? `${files[0].name.replace(/\.pdf$/i, '')}-split.zip` : undefined,
          })
        }
        label={tr('Split PDF', 'تقسیم کریں')}
      />
    </Panel>
  )
}

export function RotateOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const thumbs = usePdfThumbs(files[0], 120)
  const sel = useSelection(thumbs.count)
  const [angle, setAngle] = useState(90)
  const [scope, setScope] = useState<'all' | 'selected'>('all')
  return (
    <Panel>
      <ThumbError error={thumbs.error} />
      <Field label={tr('Rotation (clockwise)', 'گھماؤ (گھڑی کی سمت)')}>
        <Segmented
          value={angle}
          onChange={setAngle}
          options={[
            { value: 90, label: '90°' },
            { value: 180, label: '180°' },
            { value: 270, label: '270°' },
          ]}
        />
      </Field>
      <Field label={tr('Pages', 'صفحات')}>
        <Segmented
          value={scope}
          onChange={setScope}
          options={[
            { value: 'all', label: tr('All pages', 'تمام صفحات') },
            { value: 'selected', label: tr('Pages I select', 'منتخب صفحات') },
          ]}
        />
      </Field>
      {scope === 'selected' && (
        <SelectGrid thumbs={thumbs} selected={sel.selected} onToggle={sel.toggle} onSelectAll={sel.all} onClear={sel.clear} rotate={angle} />
      )}
      <ProcessButton
        disabled={!thumbs.count || (scope === 'selected' && sel.selected.size === 0)}
        onClick={() => run((p) => rotatePdf(files[0], angle, scope === 'all' ? 'all' : [...sel.selected], p))}
        label={tr('Rotate PDF', 'گھمائیں')}
      />
    </Panel>
  )
}

export function DeleteOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const thumbs = usePdfThumbs(files[0], 120)
  const sel = useSelection(thumbs.count)
  return (
    <Panel>
      <ThumbError error={thumbs.error} />
      <p className="text-sm text-muted">{tr('Tap the pages you want to remove.', 'جو صفحات ہٹانے ہیں ان پر ٹیپ کریں۔')}</p>
      <SelectGrid thumbs={thumbs} selected={sel.selected} onToggle={sel.toggle} onSelectAll={sel.all} onClear={sel.clear} variant="delete" />
      <ProcessButton
        disabled={!sel.selected.size || sel.selected.size === thumbs.count}
        onClick={() => run((p) => deletePages(files[0], [...sel.selected], p))}
        label={tr(`Delete ${sel.selected.size || ''} page${sel.selected.size === 1 ? '' : 's'}`, `${sel.selected.size || ''} صفحات حذف کریں`)}
      />
      {thumbs.count > 0 && sel.selected.size === thumbs.count && (
        <p className="text-sm font-medium text-accent-dark">{tr('Keep at least one page.', 'کم از کم ایک صفحہ رکھیں۔')}</p>
      )}
    </Panel>
  )
}

export function ExtractOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const thumbs = usePdfThumbs(files[0], 120)
  const sel = useSelection(thumbs.count)
  const [separate, setSeparate] = useState(false)
  return (
    <Panel>
      <ThumbError error={thumbs.error} />
      <p className="text-sm text-muted">{tr('Tap the pages you want to keep in the new PDF.', 'نئی پی ڈی ایف میں رکھنے کے لیے صفحات پر ٹیپ کریں۔')}</p>
      <SelectGrid thumbs={thumbs} selected={sel.selected} onToggle={sel.toggle} onSelectAll={sel.all} onClear={sel.clear} />
      <Field label={tr('Output', 'نتیجہ')}>
        <Segmented
          value={separate ? 'sep' : 'one'}
          onChange={(v) => setSeparate(v === 'sep')}
          options={[
            { value: 'one', label: tr('One PDF', 'ایک پی ڈی ایف') },
            { value: 'sep', label: tr('One PDF per page (ZIP)', 'ہر صفحے کی الگ پی ڈی ایف (ZIP)') },
          ]}
        />
      </Field>
      <ProcessButton
        disabled={!sel.selected.size}
        onClick={() =>
          run((p) => extractPages(files[0], [...sel.selected], separate, p), {
            zipAs: separate ? `${files[0].name.replace(/\.pdf$/i, '')}-pages.zip` : undefined,
          })
        }
        label={tr('Extract pages', 'صفحات نکالیں')}
      />
    </Panel>
  )
}

export function ReorderOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const thumbs = usePdfThumbs(files[0], 120)
  const [order, setOrder] = useState<number[]>([])
  useEffect(() => setOrder(Array.from({ length: thumbs.count }, (_, i) => i)), [thumbs.count])
  const changed = order.some((v, i) => v !== i)
  return (
    <Panel>
      <ThumbError error={thumbs.error} />
      <div className={`flex flex-wrap items-center gap-3 ${order.length ? '' : 'hidden'}`}>
        <p className="text-sm text-muted">
          {tr('Move pages with the arrows. The number in brackets is the original page.', 'تیروں سے صفحات منتقل کریں۔ قوسین میں اصل صفحہ نمبر ہے۔')}
        </p>
        <button
          type="button"
          onClick={() => setOrder([...order].reverse())}
          className="min-h-9 rounded-full border border-line px-3 text-sm font-medium hover:border-accent"
        >
          {tr('Reverse order', 'الٹی ترتیب')}
        </button>
        {changed && (
          <button
            type="button"
            onClick={() => setOrder(order.map((_, i) => i))}
            className="min-h-9 rounded-full border border-line px-3 text-sm font-medium hover:border-accent"
          >
            {tr('Reset', 'ری سیٹ')}
          </button>
        )}
      </div>
      <ReorderGrid thumbs={thumbs} order={order} onChange={setOrder} />
      <ProcessButton disabled={!changed} onClick={() => run((p) => reorderPages(files[0], order, p))} label={tr('Save new order', 'نئی ترتیب محفوظ کریں')} />
    </Panel>
  )
}

export function PageNumberOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [position, setPosition] = useState<NumberPosition>('bottom-center')
  const [format, setFormat] = useState<'n' | 'page-n' | 'n-of-total'>('n')
  const [start, setStart] = useState(1)
  const [size, setSize] = useState(11)
  const positions: { value: NumberPosition; label: string }[] = [
    { value: 'top-left', label: tr('Top left', 'اوپر بائیں') },
    { value: 'top-center', label: tr('Top center', 'اوپر درمیان') },
    { value: 'top-right', label: tr('Top right', 'اوپر دائیں') },
    { value: 'bottom-left', label: tr('Bottom left', 'نیچے بائیں') },
    { value: 'bottom-center', label: tr('Bottom center', 'نیچے درمیان') },
    { value: 'bottom-right', label: tr('Bottom right', 'نیچے دائیں') },
  ]
  return (
    <Panel>
      <Field label={tr('Position', 'جگہ')}>
        <div dir="ltr" className="grid max-w-sm grid-cols-3 gap-2">
          {positions.map((p) => (
            <button
              key={p.value}
              type="button"
              aria-pressed={position === p.value}
              onClick={() => setPosition(p.value)}
              className={`min-h-11 rounded-lg border px-2 text-xs font-semibold ${
                position === p.value ? 'border-accent bg-blush text-accent' : 'border-line text-muted hover:border-accent/40'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label={tr('Format', 'انداز')}>
        <Segmented
          value={format}
          onChange={setFormat}
          options={[
            { value: 'n', label: '1' },
            { value: 'page-n', label: 'Page 1' },
            { value: 'n-of-total', label: '1 / 10' },
          ]}
        />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={tr('Start at', 'آغاز')}>
          <input
            type="number"
            min={0}
            value={start}
            onChange={(e) => setStart(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            className={inputClass}
            dir="ltr"
          />
        </Field>
        <Field label={tr('Font size', 'فونٹ سائز')}>
          <Slider value={size} onChange={setSize} min={8} max={24} display={`${size} pt`} label={tr('Font size', 'فونٹ سائز')} />
        </Field>
      </div>
      <ProcessButton onClick={() => run((p) => addPageNumbers(files[0], { position, format, start, size }, p))} label={tr('Add page numbers', 'نمبر لگائیں')} />
    </Panel>
  )
}

export function WatermarkOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [text, setText] = useState('CONFIDENTIAL')
  const [size, setSize] = useState(48)
  const [opacity, setOpacity] = useState(0.2)
  const [color, setColor] = useState('#F04438')
  const [angle, setAngle] = useState(45)
  const [tiled, setTiled] = useState(false)
  return (
    <Panel>
      <Field label={tr('Watermark text', 'واٹر مارک متن')}>
        <input className={inputClass} value={text} maxLength={60} onChange={(e) => setText(e.target.value)} />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={tr('Size', 'سائز')}>
          <Slider value={size} onChange={setSize} min={16} max={120} display={`${size} pt`} label={tr('Size', 'سائز')} />
        </Field>
        <Field label={tr('Opacity', 'شفافیت')}>
          <Slider value={opacity} onChange={setOpacity} min={0.05} max={1} step={0.05} display={`${Math.round(opacity * 100)}%`} label={tr('Opacity', 'شفافیت')} />
        </Field>
        <Field label={tr('Angle', 'زاویہ')}>
          <Segmented
            value={angle}
            onChange={setAngle}
            options={[
              { value: 0, label: '0°' },
              { value: 45, label: '45°' },
              { value: 90, label: '90°' },
            ]}
          />
        </Field>
        <Field label={tr('Color', 'رنگ')}>
          <div className="flex items-center gap-2">
            {['#F04438', '#101828', '#667085', '#2E90FA'].map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className={`size-9 rounded-full ring-offset-2 ring-offset-card ${color === c ? 'ring-2 ring-accent' : ''}`}
                style={{ background: c }}
              />
            ))}
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label={tr('Custom color', 'اپنا رنگ')} className="size-9 cursor-pointer rounded-full border border-line bg-transparent" />
          </div>
        </Field>
      </div>
      <Field label={tr('Layout', 'ترتیب')}>
        <Segmented
          value={tiled ? 'tile' : 'center'}
          onChange={(v) => setTiled(v === 'tile')}
          options={[
            { value: 'center', label: tr('Once, centered', 'ایک بار، درمیان میں') },
            { value: 'tile', label: tr('Tiled across page', 'پورے صفحے پر') },
          ]}
        />
      </Field>
      <div className="grid h-40 place-items-center overflow-hidden rounded-xl border border-line bg-white">
        <span
          className="font-bold whitespace-nowrap"
          style={{ color, opacity, transform: `rotate(${-angle}deg)`, fontSize: Math.max(14, size / 2) }}
        >
          {text || ' '}
        </span>
      </div>
      <ProcessButton
        disabled={!text.trim()}
        onClick={() => run((p) => addWatermark(files[0], { text, size, opacity, color, angle, tiled }, p))}
        label={tr('Add watermark', 'واٹر مارک لگائیں')}
      />
    </Panel>
  )
}

export function JpgToPdfOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('a4')
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto')
  const [margin, setMargin] = useState(20)
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('One image per page, in the order shown above.', 'ہر صفحے پر ایک تصویر، اوپر کی ترتیب میں۔')}</p>
      <Field label={tr('Page size', 'صفحے کا سائز')}>
        <Segmented
          value={pageSize}
          onChange={setPageSize}
          options={[
            { value: 'a4', label: 'A4' },
            { value: 'letter', label: 'Letter' },
            { value: 'fit', label: tr('Same as image', 'تصویر جتنا') },
          ]}
        />
      </Field>
      {pageSize !== 'fit' && (
        <Field label={tr('Orientation', 'رخ')}>
          <Segmented
            value={orientation}
            onChange={setOrientation}
            options={[
              { value: 'auto', label: tr('Auto', 'خودکار') },
              { value: 'portrait', label: tr('Portrait', 'عمودی') },
              { value: 'landscape', label: tr('Landscape', 'افقی') },
            ]}
          />
        </Field>
      )}
      <Field label={tr('Margin', 'حاشیہ')}>
        <Segmented
          value={margin}
          onChange={setMargin}
          options={[
            { value: 0, label: tr('None', 'کوئی نہیں') },
            { value: 20, label: tr('Small', 'چھوٹا') },
            { value: 40, label: tr('Large', 'بڑا') },
          ]}
        />
      </Field>
      <ProcessButton onClick={() => run((p) => imagesToPdf(files, { pageSize, orientation, margin }, p))} label={tr('Convert to PDF', 'پی ڈی ایف بنائیں')} />
    </Panel>
  )
}

export function PdfToJpgOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [dpi, setDpi] = useState(150)
  const [quality, setQuality] = useState(0.85)
  const [output, setOutput] = useState<'zip' | 'separate'>('zip')
  return (
    <Panel>
      <Field label={tr('Resolution', 'ریزولوشن')} hint={tr('Higher DPI gives sharper images and bigger files.', 'زیادہ DPI سے تصویر صاف اور فائل بڑی ہوتی ہے۔')}>
        <Segmented
          value={dpi}
          onChange={setDpi}
          options={[
            { value: 72, label: '72 DPI' },
            { value: 150, label: '150 DPI' },
            { value: 300, label: '300 DPI' },
          ]}
        />
      </Field>
      <Field label={tr('JPEG quality', 'JPEG کوالٹی')}>
        <Slider value={quality} onChange={setQuality} min={0.4} max={1} step={0.05} display={`${Math.round(quality * 100)}%`} label={tr('JPEG quality', 'JPEG کوالٹی')} />
      </Field>
      <Field label={tr('Download as', 'ڈاؤن لوڈ کا طریقہ')} hint={tr('A single-page PDF always downloads as one JPG.', 'ایک صفحے کی پی ڈی ایف ہمیشہ ایک JPG بنے گی۔')}>
        <Segmented
          value={output}
          onChange={setOutput}
          options={[
            { value: 'zip', label: tr('One ZIP file', 'ایک ZIP فائل') },
            { value: 'separate', label: tr('Separate JPGs', 'الگ الگ JPG') },
          ]}
        />
      </Field>
      <ProcessButton
        onClick={() =>
          run((p) => pdfToJpg(files[0], { dpi, quality }, p), {
            zipAs: output === 'zip' ? `${files[0].name.replace(/\.pdf$/i, '')}-jpg.zip` : undefined,
          })
        }
        label={tr('Convert to JPG', 'JPG بنائیں')}
      />
    </Panel>
  )
}

export function CompressOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const presets = { low: { dpi: 150, quality: 0.8 }, medium: { dpi: 110, quality: 0.65 }, high: { dpi: 80, quality: 0.5 } }
  return (
    <Panel>
      <div className="rounded-xl border border-accent/30 bg-blush px-4 py-3 text-sm leading-relaxed">
        <strong className="text-accent-dark">{tr('Heads up:', 'نوٹ:')}</strong>{' '}
        {tr(
          'each page is redrawn as a JPEG image. Text will no longer be selectable or searchable, and links stop working. Keep your original.',
          'ہر صفحہ JPEG تصویر بنا دیا جاتا ہے۔ متن منتخب یا تلاش نہیں ہو سکے گا اور لنکس کام نہیں کریں گے۔ اصل فائل رکھیں۔',
        )}
      </div>
      <Field label={tr('Compression', 'کمپریشن')}>
        <Segmented
          value={level}
          onChange={setLevel}
          options={[
            { value: 'low', label: tr('Light (sharper)', 'ہلکی (صاف)') },
            { value: 'medium', label: tr('Balanced', 'متوازن') },
            { value: 'high', label: tr('Strong (smaller)', 'زیادہ (چھوٹی)') },
          ]}
        />
      </Field>
      <p className="text-sm text-muted" dir="ltr">
        {presets[level].dpi} DPI · JPEG {Math.round(presets[level].quality * 100)}%
      </p>
      <ProcessButton
        onClick={() => run((p) => compressPdf(files[0], presets[level], p), { compareSize: files[0].size })}
        label={tr('Compress PDF', 'کمپریس کریں')}
      />
    </Panel>
  )
}
