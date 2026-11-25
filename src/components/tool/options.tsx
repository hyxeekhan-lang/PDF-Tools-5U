import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '#/lib/i18n'
import {
  type NumberPosition,
  type Output,
  type Progress,
  type Placement,
  ToolError,
  annotatePdf,
  formatBytes,
  baseName,
  validateFile,
  addPageNumbers,
  addHeaderFooter,
  addImageToPdf,
  addTextToPdf,
  addLinkPreviewToPdf,
  addWatermark,
  compressPdf,
  comparePdfText,
  cropPdf,
  deletePages,
  duplicatePages,
  drawOnPdf,
  extractPdfImages,
  extractPages,
  extractMetadata,
  excelToPdf,
  flattenPdf,
  htmlToPdf,
  heicToPdf,
  highlightTextPdf,
  imagesToPdf,
  mergePdfs,
  removeMetadata,
  pdfToText,
  parseRanges,
  pdfToJpg,
  pdfToHtml,
  pdfToJson,
  pdfToCsv,
  checkPdfAccessibility,
  createPdfForm,
  pdfToMarkdown,
  pdfToPng,
  pdfToPowerpoint,
  pdfToExcel,
  pdfToWord,
  protectPdf,
  repairPdf,
  redactTextPdf,
  optimizePdf,
  ocrPdf,
  textToPdf,
  wordToPdf,
  powerpointToPdf,
  reorderPages,
  rotatePdf,
  splitPdf,
  updateMetadata,
  unlockPdf,
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

export function ProtectOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const matches = password === confirm
  return (
    <Panel>
      <Field label={tr('Opening password', 'PDF کھولنے کا پاس ورڈ')} hint={tr('Use 8–127 characters. Keep this password safe; it cannot be recovered.', '8 سے 127 حروف استعمال کریں۔ پاس ورڈ محفوظ رکھیں؛ اسے واپس حاصل نہیں کیا جا سکتا۔')}>
        <input className={inputClass} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </Field>
      <Field label={tr('Confirm password', 'پاس ورڈ کی تصدیق')}>
        <input className={inputClass} type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
      </Field>
      {!matches && confirm && <p className="text-sm font-medium text-accent-dark">{tr('Passwords do not match.', 'پاس ورڈ ایک جیسے نہیں ہیں۔')}</p>}
      <p className="text-sm text-muted">{tr('Password protection uses AES-256. Processing happens in your browser.', 'پاس ورڈ تحفظ AES-256 استعمال کرتا ہے۔ فائل آپ کے براؤزر میں پروسیس ہوتی ہے۔')}</p>
      <ProcessButton disabled={password.length < 8 || password.length > 127 || !matches} onClick={() => run((progress) => protectPdf(files[0], password, progress))} label={tr('Protect PDF', 'PDF محفوظ کریں')} />
    </Panel>
  )
}

export function UnlockOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [password, setPassword] = useState('')
  return (
    <Panel>
      <Field label={tr('PDF password', 'PDF پاس ورڈ')}>
        <input className={inputClass} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </Field>
      <p className="text-sm text-muted">{tr('Only unlock documents you are authorized to access. The supplied password is needed to decrypt the file.', 'صرف وہ دستاویزات unlock کریں جن تک رسائی کی اجازت ہو۔ فائل decrypt کرنے کے لیے درست پاس ورڈ ضروری ہے۔')}</p>
      <ProcessButton disabled={!password} onClick={() => run((progress) => unlockPdf(files[0], password, progress))} label={tr('Unlock PDF', 'PDF unlock کریں')} />
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

export function DuplicateOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const thumbs = usePdfThumbs(files[0], 120)
  const sel = useSelection(thumbs.count)
  return (
    <Panel>
      <ThumbError error={thumbs.error} />
      <p className="text-sm text-muted">{tr('Select pages to add a copy of after the original document.', 'اصل دستاویز کے بعد کاپی شامل کرنے کے لیے صفحات منتخب کریں۔')}</p>
      <SelectGrid thumbs={thumbs} selected={sel.selected} onToggle={sel.toggle} onSelectAll={sel.all} onClear={sel.clear} />
      <ProcessButton
        disabled={!sel.selected.size}
        onClick={() => run((p) => duplicatePages(files[0], [...sel.selected].sort((a, b) => a - b), p))}
        label={tr('Duplicate pages', 'صفحات نقل کریں')}
      />
    </Panel>
  )
}

export function RemoveMetadataOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Remove standard document properties and the catalog XMP metadata packet. This does not inspect metadata embedded inside page content or images.', 'دستاویز کی standard properties اور XMP metadata packet ہٹائیں۔ Page content یا تصاویر کے اندر کا metadata الگ ہے۔')}</p>
      <ProcessButton onClick={() => run((p) => removeMetadata(files[0], p))} label={tr('Remove metadata', 'میٹا ڈیٹا ہٹائیں')} />
    </Panel>
  )
}

export function EditMetadataOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [subject, setSubject] = useState('')
  const [keywords, setKeywords] = useState('')
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Set standard PDF document properties. Leave a field blank to clear its current value.', 'PDF کی document properties مرتب کریں۔ موجودہ قدر خالی کرنے کے لیے فیلڈ خالی چھوڑیں۔')}</p>
      <Field label={tr('Title', 'عنوان')}><input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
      <Field label={tr('Author', 'مصنف')}><input className={inputClass} value={author} onChange={(event) => setAuthor(event.target.value)} /></Field>
      <Field label={tr('Subject', 'موضوع')}><input className={inputClass} value={subject} onChange={(event) => setSubject(event.target.value)} /></Field>
      <Field label={tr('Keywords (comma-separated)', 'کلیدی الفاظ (comma-separated)')}><input className={inputClass} value={keywords} onChange={(event) => setKeywords(event.target.value)} /></Field>
      <ProcessButton onClick={() => run((progress) => updateMetadata(files[0], { title, author, subject, keywords }, progress))} label={tr('Save metadata', 'Metadata محفوظ کریں')} />
    </Panel>
  )
}

export function RepairOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Attempts to render pages readable by PDF.js and rebuild them as images. Recovered files lose selectable text, forms, links, and original metadata.', 'PDF.js سے پڑھے جانے والے صفحات کو تصاویر کے طور پر دوبارہ بناتا ہے۔ متن، فارم، links اور اصل metadata باقی نہیں رہتے۔')}</p>
      <ProcessButton onClick={() => run((progress) => repairPdf(files[0], progress))} label={tr('Attempt repair', 'مرمت کی کوشش کریں')} />
    </Panel>
  )
}

export function OcrOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [dpi, setDpi] = useState(180)
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Runs English OCR in your browser and adds invisible searchable text over rasterized pages. The English language model is downloaded from the Tesseract CDN; your PDF stays on this device. Existing links and form fields are not retained.', 'English OCR اسی براؤزر میں چلتا ہے اور صفحات پر invisible searchable متن لگاتا ہے۔ English model Tesseract CDN سے ڈاؤن لوڈ ہوتا ہے؛ PDF اس آلے پر رہتی ہے۔ Links اور forms محفوظ نہیں رہتے۔')}</p>
      <Field label={tr('Resolution', 'ریزولوشن')}>
        <Segmented value={dpi} onChange={setDpi} options={[{ value: 120, label: '120 DPI' }, { value: 180, label: '180 DPI' }, { value: 240, label: '240 DPI' }]} />
      </Field>
      <ProcessButton onClick={() => run((progress) => ocrPdf(files[0], dpi, progress))} label={tr('Make searchable', 'Searchable بنائیں')} />
    </Panel>
  )
}

export function BatchOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [operation, setOperation] = useState<'optimize' | 'metadata' | 'rotate'>('optimize')
  const labels = {
    optimize: tr('Optimize structure', 'ساخت بہتر کریں'),
    metadata: tr('Remove metadata', 'Metadata ہٹائیں'),
    rotate: tr('Rotate pages 90°', 'صفحات 90° گھمائیں'),
  }
  const process = operation === 'optimize' ? optimizePdf : operation === 'metadata' ? removeMetadata : (file: File, progress: Progress) => rotatePdf(file, 90, 'all', progress)
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Apply one local operation to each selected PDF. Results are bundled into one ZIP archive.', 'ہر منتخب PDF پر ایک مقامی عمل کریں۔ نتائج ایک ZIP میں جمع ہوں گے۔')}</p>
      <Field label={tr('Operation', 'عمل')}>
        <Segmented value={operation} onChange={setOperation} options={[
          { value: 'optimize', label: labels.optimize },
          { value: 'metadata', label: labels.metadata },
          { value: 'rotate', label: labels.rotate },
        ]} />
      </Field>
      <ProcessButton onClick={() => run(async (progress) => {
        const outputs: Output[] = []
        for (let index = 0; index < files.length; index++) {
          const current = index
          const result = await process(files[current], (fraction, label) => progress((current + fraction) / files.length, `${current + 1}/${files.length}${label ? ` · ${label}` : ''}`))
          outputs.push({ ...result[0], name: `${baseName(files[current].name)}-${operation}.pdf` })
        }
        return outputs
      }, { zipAs: 'pdfpilot5u-batch-results.zip' })} label={tr(`Process ${files.length} PDFs`, `${files.length} PDFs پروسیس کریں`)} />
    </Panel>
  )
}

export function PdfToTextOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Extract selectable text and keep page boundaries in a plain text file.', 'منتخب قابل متن نکالیں اور صفحات کی حدیں سادہ ٹیکسٹ فائل میں رکھیں۔')}</p>
      <ProcessButton onClick={() => run((p) => pdfToText(files[0], p))} label={tr('Extract text', 'متن نکالیں')} />
    </Panel>
  )
}

export function FlattenOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Make interactive AcroForm fields static. This does not flatten comments or annotations.', 'Interactive form fields کو static بنائیں۔ Comments اور annotations شامل نہیں۔')}</p>
      <ProcessButton onClick={() => run((p) => flattenPdf(files[0], p))} label={tr('Flatten form fields', 'Form fields flatten کریں')} />
    </Panel>
  )
}

export function OptimizeOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Rewrite PDF objects with compact object streams. This preserves page text and images, but may not reduce every file.', 'PDF objects کو compact object streams میں محفوظ کریں۔ یہ متن اور تصاویر برقرار رکھتا ہے، مگر ہر فائل کا سائز کم ہونا یقینی نہیں۔')}</p>
      <ProcessButton onClick={() => run((p) => optimizePdf(files[0], p), { compareSize: files[0].size })} label={tr('Optimize PDF', 'PDF بہتر کریں')} />
    </Panel>
  )
}

export function MetadataOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Export document metadata and each page’s dimensions as JSON.', 'دستاویز کا metadata اور ہر صفحے کے dimensions JSON میں حاصل کریں۔')}</p>
      <ProcessButton onClick={() => run((p) => extractMetadata(files[0], p))} label={tr('Extract metadata', 'Metadata نکالیں')} />
    </Panel>
  )
}

export function ExtractImagesOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">
        {tr(
          'Export embedded raster images as individual PNG files. Vector artwork and page backgrounds are not extracted.',
          'PDF میں شامل تصاویر الگ PNG فائلوں میں حاصل کریں۔ Vector artwork اور صفحے کے backgrounds شامل نہیں ہوں گے۔',
        )}
      </p>
      <ProcessButton onClick={() => run((progress) => extractPdfImages(files[0], progress))} label={tr('Extract images', 'تصاویر نکالیں')} />
    </Panel>
  )
}

export function PdfToPngOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [dpi, setDpi] = useState(150)
  const [output, setOutput] = useState<'zip' | 'separate'>('zip')
  return (
    <Panel>
      <Field label={tr('Resolution', 'ریزولوشن')}>
        <Segmented value={dpi} onChange={setDpi} options={[{ value: 72, label: '72 DPI' }, { value: 150, label: '150 DPI' }, { value: 300, label: '300 DPI' }]} />
      </Field>
      <Field label={tr('Download as', 'ڈاؤن لوڈ کا طریقہ')}>
        <Segmented value={output} onChange={setOutput} options={[{ value: 'zip', label: tr('One ZIP file', 'ایک ZIP فائل') }, { value: 'separate', label: tr('Separate PNGs', 'الگ PNG') }]} />
      </Field>
      <ProcessButton
        onClick={() => run((p) => pdfToPng(files[0], dpi, p), { zipAs: output === 'zip' ? `${files[0].name.replace(/\.pdf$/i, '')}-png.zip` : undefined })}
        label={tr('Convert to PNG', 'PNG میں تبدیل کریں')}
      />
    </Panel>
  )
}

export function PdfToPowerPointOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [dpi, setDpi] = useState(120)
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Each PDF page becomes a full-slide image. Page appearance is preserved, but slide text and objects are not editable. Higher resolution increases file size and memory use.', 'ہر PDF صفحہ سلائیڈ کی تصویر بنے گا۔ شکل برقرار رہے گی، مگر متن اور اشیا edit نہیں ہو سکیں گے۔ زیادہ resolution سے فائل اور memory کا استعمال بڑھے گا۔')}</p>
      <Field label={tr('Image resolution', 'تصویر کی ریزولوشن')}>
        <Segmented value={dpi} onChange={setDpi} options={[{ value: 72, label: '72 DPI' }, { value: 120, label: '120 DPI' }, { value: 180, label: '180 DPI' }]} />
      </Field>
      <ProcessButton onClick={() => run((progress) => pdfToPowerpoint(files[0], dpi, progress))} label={tr('Convert to PowerPoint', 'PowerPoint میں تبدیل کریں')} />
    </Panel>
  )
}

function TextExportOptions({ files, run, format }: OptionsProps & { format: 'html' | 'markdown' | 'json' }) {
  const { tr } = useI18n()
  const actions = { html: pdfToHtml, markdown: pdfToMarkdown, json: pdfToJson }
  const labels = { html: 'HTML', markdown: 'Markdown', json: 'JSON' }
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('This extracts selectable text. Scanned pages require OCR and are not recognized by this export.', 'یہ selectable متن نکالتا ہے۔ Scanned صفحات کے لیے OCR درکار ہے۔')}</p>
      <ProcessButton onClick={() => run((p) => actions[format](files[0], p))} label={tr(`Export ${labels[format]}`, `${labels[format]} برآمد کریں`)} />
    </Panel>
  )
}

export function PdfToHtmlOptions(props: OptionsProps) {
  return <TextExportOptions {...props} format="html" />
}

export function PdfToMarkdownOptions(props: OptionsProps) {
  return <TextExportOptions {...props} format="markdown" />
}

export function PdfToJsonOptions(props: OptionsProps) {
  return <TextExportOptions {...props} format="json" />
}

export function AddTextOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [text, setText] = useState('')
  const [size, setSize] = useState(12)
  return (
    <Panel>
      <Field label={tr('Text (basic Latin characters)', 'متن (بنیادی لاطینی حروف)')}>
        <textarea className={inputClass} rows={3} maxLength={300} value={text} onChange={(event) => setText(event.target.value)} />
      </Field>
      <Field label={tr('Font size', 'فونٹ سائز')}>
        <Segmented value={size} onChange={setSize} options={[{ value: 10, label: '10 pt' }, { value: 12, label: '12 pt' }, { value: 16, label: '16 pt' }]} />
      </Field>
      <p className="text-sm text-muted">{tr('Text is placed at the bottom-left of every page. This is a basic stamping tool, not a full text editor.', 'متن ہر صفحے کے نیچے بائیں جانب لگے گا۔ یہ بنیادی ٹول ہے، مکمل PDF editor نہیں۔')}</p>
      <ProcessButton disabled={!text.trim()} onClick={() => run((p) => addTextToPdf(files[0], text, size, p))} label={tr('Add text', 'متن شامل کریں')} />
    </Panel>
  )
}

export function AddLinkPreviewOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [url, setUrl] = useState('https://')
  let host = 'Your link preview'
  try { host = new URL(url).hostname || host } catch { /* live preview remains a safe placeholder */ }
  return (
    <Panel>
      <Field label={tr('Website URL', 'ویب سائٹ URL')}>
        <input className={inputClass} type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" maxLength={500} />
      </Field>
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-blush p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-white" aria-hidden="true">↗</span>
        <div className="min-w-0"><p className="font-semibold">{host}</p><p className="truncate text-sm text-muted">{url === 'https://' ? 'Paste a URL to preview it here' : url}</p></div>
      </div>
      <p className="text-sm text-muted">A clickable link card is added to the bottom-left of every PDF page. The website preview is generated privately from the URL; no page content is fetched.</p>
      <ProcessButton disabled={!/^https?:\/\/[^\s]+$/i.test(url.trim())} onClick={() => run((p) => addLinkPreviewToPdf(files[0], url, p))} label={tr('Add link preview', 'لنک پری ویو شامل کریں')} />
    </Panel>
  )
}

export function DrawOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const [hasMark, setHasMark] = useState(false)
  const thumbs = usePdfThumbs(files[0], 120)
  const selection = useSelection(thumbs.count)
  const clear = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    setHasMark(false)
  }
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => ({ x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY })
  const save = async () => {
    const canvas = canvasRef.current
    if (!canvas || !hasMark || selection.selected.size !== 1) return
    const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob: Blob | null) => blob ? resolve(blob) : reject(new Error('Could not encode drawing.')), 'image/png'))
    const place: Placement = { pageIndex: [...selection.selected][0], left: 0.1, top: 0.1, width: 0.3, height: 0.12 }
    const bytes = new Uint8Array(await png.arrayBuffer())
    run((progress) => drawOnPdf(files[0], bytes, place, progress))
  }
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Draw a mark, then choose exactly one page. Your drawing is embedded visibly on the selected page.', 'نشان بنائیں، پھر صرف ایک صفحہ منتخب کریں۔ نشان منتخب صفحے پر نظر آئے گا۔')}</p>
      <canvas
        ref={canvasRef}
        width={320}
        height={120}
        aria-label={tr('Drawing area', 'ڈرائنگ کی جگہ')}
        className="w-full max-w-[320px] touch-none rounded-xl border border-dashed border-line bg-white"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          lastPoint.current = point(event)
          drawing.current = true
        }}
        onPointerMove={(event) => {
          if (!drawing.current || !lastPoint.current) return
          const context = event.currentTarget.getContext('2d')
          if (!context) return
          const current = point(event)
          context.strokeStyle = '#B42318'
          context.lineWidth = 4
          context.lineCap = 'round'
          context.beginPath()
          context.moveTo(lastPoint.current.x, lastPoint.current.y)
          context.lineTo(current.x, current.y)
          context.stroke()
          lastPoint.current = current
          setHasMark(true)
        }}
        onPointerUp={() => { drawing.current = false; lastPoint.current = null }}
        onPointerCancel={() => { drawing.current = false; lastPoint.current = null }}
      />
      <div className="flex gap-3">
        <button type="button" onClick={clear} className="min-h-10 rounded-full border border-line px-4 text-sm font-semibold">{tr('Clear drawing', 'ڈرائنگ صاف کریں')}</button>
      </div>
      <ThumbError error={thumbs.error} />
      <SelectGrid thumbs={thumbs} selected={selection.selected} onToggle={selection.toggle} onSelectAll={selection.all} onClear={selection.clear} />
      <ProcessButton disabled={!hasMark || selection.selected.size !== 1} onClick={save} label={tr('Add drawing to PDF', 'PDF پر ڈرائنگ شامل کریں')} />
    </Panel>
  )
}

export function HighlightOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [phrase, setPhrase] = useState('')
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Highlights complete selectable text runs containing the phrase. Scanned pages need OCR first; text split across PDF runs may not match.', 'منتخب متن کی ان سطروں کو highlight کرتا ہے جن میں یہ عبارت ہو۔ Scanned صفحات کے لیے پہلے OCR کریں؛ الگ text runs میں بٹی عبارت نہیں مل سکتی۔')}</p>
      <Field label={tr('Word or phrase', 'لفظ یا عبارت')}>
        <input className={inputClass} value={phrase} maxLength={120} onChange={(event) => setPhrase(event.target.value)} />
      </Field>
      <ProcessButton disabled={!phrase.trim()} onClick={() => run((progress) => highlightTextPdf(files[0], phrase, progress))} label={tr('Highlight matches', 'متن Highlight کریں')} />
    </Panel>
  )
}

export function AnnotateOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [note, setNote] = useState('')
  const thumbs = usePdfThumbs(files[0], 120)
  const selection = useSelection(thumbs.count)
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Adds a visible flattened note to the pages you select. Notes use basic Latin characters and are not interactive PDF comments.', 'منتخب صفحات پر واضح flattened نوٹ شامل کرتا ہے۔ نوٹ interactive PDF comments نہیں ہیں۔')}</p>
      <Field label={tr('Note (up to 240 characters)', 'نوٹ (240 حروف تک)')}>
        <textarea className={inputClass} rows={3} maxLength={240} value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
      <ThumbError error={thumbs.error} />
      <SelectGrid thumbs={thumbs} selected={selection.selected} onToggle={selection.toggle} onSelectAll={selection.all} onClear={selection.clear} />
      <ProcessButton disabled={!note.trim() || !selection.selected.size} onClick={() => run((progress) => annotatePdf(files[0], note, [...selection.selected].sort((a, b) => a - b), progress))} label={tr('Add note', 'نوٹ شامل کریں')} />
    </Panel>
  )
}

export function RedactOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [phrase, setPhrase] = useState('')
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Finds matching selectable text and permanently removes it by replacing every page with a raster image containing opaque black masks. This removes searchable text, links and forms from the output; check every page before sharing. Text split across runs and scanned text may not match.', 'منتخب متن تلاش کرکے تمام صفحات کو opaque سیاہ masks والی تصاویر سے بدلتا ہے۔ نتیجے سے searchable متن، links اور forms ہٹ جائیں گے؛ شیئر کرنے سے پہلے ہر صفحہ چیک کریں۔ الگ text runs اور scanned متن ممکن ہے نہ ملیں۔')}</p>
      <Field label={tr('Text to redact', 'مٹانے کے لیے متن')}>
        <input className={inputClass} value={phrase} maxLength={120} onChange={(event) => setPhrase(event.target.value)} />
      </Field>
      <ProcessButton disabled={!phrase.trim()} onClick={() => run((progress) => redactTextPdf(files[0], phrase, progress))} label={tr('Redact text', 'متن مٹائیں')} />
    </Panel>
  )
}

export function HeaderFooterOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [header, setHeader] = useState('')
  const [footer, setFooter] = useState('')
  const [size, setSize] = useState(10)
  return (
    <Panel>
      <Field label={tr('Header (optional)', 'Header (اختیاری)')}><input className={inputClass} value={header} maxLength={200} onChange={(event) => setHeader(event.target.value)} /></Field>
      <Field label={tr('Footer (optional)', 'Footer (اختیاری)')}><input className={inputClass} value={footer} maxLength={200} onChange={(event) => setFooter(event.target.value)} /></Field>
      <Field label={tr('Font size', 'فونٹ سائز')}><Segmented value={size} onChange={setSize} options={[{ value: 8, label: '8 pt' }, { value: 10, label: '10 pt' }, { value: 12, label: '12 pt' }]} /></Field>
      <ProcessButton disabled={!header.trim() && !footer.trim()} onClick={() => run((p) => addHeaderFooter(files[0], { header, footer, size }, p))} label={tr('Add header/footer', 'Header/footer شامل کریں')} />
    </Panel>
  )
}

export function CropOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [margins, setMargins] = useState({ top: 0, right: 0, bottom: 0, left: 0 })
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Set how many PDF points to trim from each edge on every page. This changes the visible crop box; it does not erase hidden content.', 'ہر صفحے کے کناروں سے PDF points میں crop کریں۔ یہ visible area بدلتا ہے، پوشیدہ مواد حذف نہیں کرتا۔')}</p>
      <div className="grid grid-cols-2 gap-3">
        {(['top', 'right', 'bottom', 'left'] as const).map((edge) => (
          <Field key={edge} label={tr(`${edge[0].toUpperCase()}${edge.slice(1)} margin (pt)`, `${edge} margin (pt)`)}>
            <input type="number" min="0" max="500" className={inputClass} value={margins[edge]} onChange={(event) => setMargins((current) => ({ ...current, [edge]: Number(event.target.value) }))} />
          </Field>
        ))}
      </div>
      <ProcessButton disabled={!Object.values(margins).some(Boolean)} onClick={() => run((p) => cropPdf(files[0], margins, p))} label={tr('Crop PDF', 'PDF crop کریں')} />
    </Panel>
  )
}

export function CompareOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Choose two PDFs in before/after order. The report compares selectable text and page counts; it does not detect visual layout or image differences.', 'دو PDFs پہلے/بعد کی ترتیب میں منتخب کریں۔ رپورٹ متن اور صفحات کا موازنہ کرے گی، بصری فرق نہیں۔')}</p>
      {files.length !== 2 && <p className="text-sm font-semibold text-accent-dark">{tr(`Choose exactly two files (currently ${files.length}).`, `بالکل دو فائلیں منتخب کریں (ابھی ${files.length})۔`)}</p>}
      <ProcessButton disabled={files.length !== 2} onClick={() => run((p) => comparePdfText(files, p))} label={tr('Compare text', 'متن کا موازنہ کریں')} />
    </Panel>
  )
}

export function TextToPdfOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Converts plain text using a basic Latin font, with line wrapping and automatic pages. Rich text and non-Latin glyphs are not supported in this browser conversion.', 'Plain text کو basic Latin font سے pages میں تبدیل کریں۔')}</p>
      <ProcessButton onClick={() => run((p) => textToPdf(files[0], p))} label={tr('Convert TXT to PDF', 'TXT کو PDF میں بدلیں')} />
    </Panel>
  )
}

function ConversionOptions({ files, run, label, convert }: OptionsProps & { label: string; convert: (file: File, progress: Progress) => Promise<Output[]> }) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">{label}</p>
      <ProcessButton onClick={() => run((progress) => convert(files[0], progress))} label={tr('Convert file', 'فائل تبدیل کریں')} />
    </Panel>
  )
}

export function WordToPdfOptions(props: OptionsProps) {
  const { tr } = useI18n()
  return <ConversionOptions {...props} convert={wordToPdf} label={tr('Extracts DOCX text into a basic PDF. Original formatting, images and embedded objects are not retained.', 'DOCX متن کو سادہ PDF میں منتقل کرتا ہے۔ اصل فارمیٹنگ، تصاویر اور embedded اشیا شامل نہیں ہوں گی۔')} />
}

export function ExcelToPdfOptions(props: OptionsProps) {
  const { tr } = useI18n()
  return <ConversionOptions {...props} convert={excelToPdf} label={tr('Extracts XLSX cell text into a basic PDF. Formulas, formatting and print layout are not retained.', 'XLSX cell متن کو سادہ PDF میں منتقل کرتا ہے۔ فارمولے، فارمیٹنگ اور print layout شامل نہیں ہوں گے۔')} />
}

export function PowerPointToPdfOptions(props: OptionsProps) {
  const { tr } = useI18n()
  return <ConversionOptions {...props} convert={powerpointToPdf} label={tr('Extracts PPTX slide text into a basic PDF. Original slide layout and images are not retained.', 'PPTX سلائیڈ کا متن سادہ PDF میں منتقل کرتا ہے۔ اصل layout اور تصاویر شامل نہیں ہوں گی۔')} />
}

export function HtmlToPdfOptions(props: OptionsProps) {
  const { tr } = useI18n()
  return <ConversionOptions {...props} convert={htmlToPdf} label={tr('Extracts readable text from a local HTML file. Styling, images and links are not retained.', 'مقامی HTML فائل سے قابلِ مطالعہ متن نکالتا ہے۔ styling، تصاویر اور links شامل نہیں ہوں گے۔')} />
}

export function PdfToWordOptions(props: OptionsProps) {
  const { tr } = useI18n()
  return <ConversionOptions {...props} convert={pdfToWord} label={tr('Exports selectable text page by page as an editable DOCX. Scanned pages require OCR; layout is simplified.', 'منتخب ہونے والا متن DOCX میں برآمد کرتا ہے۔ scanned صفحات کے لیے OCR درکار ہے؛ layout سادہ ہوگا۔')} />
}

export function PdfToExcelOptions(props: OptionsProps) {
  const { tr } = useI18n()
  return <ConversionOptions {...props} convert={pdfToExcel} label={tr('Exports selectable text from each page into an XLSX workbook. It does not infer table columns.', 'ہر صفحے کا منتخب متن XLSX میں برآمد کرتا ہے۔ جدول کے کالم خودکار طور پر شناخت نہیں ہوتے۔')} />
}

export function AddImageOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const chooseImage = async (file?: File) => {
    setError('')
    if (!file) return setImageFile(null)
    try {
      await validateFile(file, 'image')
      setImageFile(file)
    } catch (cause) {
      setImageFile(null)
      setError(cause instanceof Error ? cause.message : 'The image file could not be validated.')
    }
  }
  return (
    <Panel>
      <Field label={tr('JPG or PNG image', 'JPG یا PNG تصویر')}>
        <input type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={(event) => void chooseImage(event.target.files?.[0])} className={inputClass} />
      </Field>
      {imageFile && <p className="text-sm text-muted">{imageFile.name} · {formatBytes(imageFile.size)}</p>}
      {error && <p role="alert" className="text-sm text-accent-dark">{error}</p>}
      <p className="text-sm text-muted">{tr('The image is centered on each page and scaled to at most 40% of its width and height.', 'تصویر ہر صفحے کے درمیان میں زیادہ سے زیادہ 40% سائز پر لگے گی۔')}</p>
      <ProcessButton disabled={!imageFile} onClick={() => imageFile && run((p) => addImageToPdf(files[0], imageFile, p))} label={tr('Add image to PDF', 'PDF میں تصویر شامل کریں')} />
    </Panel>
  )
}

export function PdfToCsvOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Groups positioned text into approximate rows and columns. Complex or scanned tables may need OCR or manual cleanup.', 'متن کی جگہ سے اندازاً rows اور columns بناتا ہے؛ پیچیدہ scanned tables کی manual صفائی درکار ہو سکتی ہے۔')}</p>
      <ProcessButton onClick={() => run((p) => pdfToCsv(files[0], p))} label={tr('Export CSV', 'CSV بنائیں')} />
    </Panel>
  )
}

export function AccessibilityCheckerOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return <Panel>
    <p className="text-sm text-muted">{tr('Creates a browser-level JSON report for selectable text, page dimensions, and image-only pages. It is not formal PDF/UA certification.', 'یہ براؤزر کی سطح پر accessibility رپورٹ بناتا ہے؛ یہ رسمی PDF/UA certification نہیں ہے۔')}</p>
    <ProcessButton onClick={() => run((p) => checkPdfAccessibility(files[0], p))} label={tr('Check accessibility', 'Accessibility چیک کریں')} />
  </Panel>
}

export function PdfFormCreatorOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  const [fields, setFields] = useState(['Name', 'Email', 'Comments'])
  return <Panel>
    <p className="text-sm text-muted">{tr('Adds up to eight fillable text fields to the first page of your PDF. Keep the original file because fields are placed on a new copy.', 'پہلے صفحے پر زیادہ سے زیادہ آٹھ قابلِ تحریر text fields شامل کریں۔')}</p>
    <div className="space-y-2">{fields.map((field, index) => <input key={index} className={inputClass} value={field} maxLength={120} aria-label={`Form field ${index + 1} label`} onChange={(event) => setFields((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />)}</div>
    <button type="button" className="min-h-9 rounded-full border border-line px-3 text-sm" onClick={() => fields.length < 8 && setFields((current) => [...current, `Field ${current.length + 1}`])} disabled={fields.length >= 8}>{tr('Add field', 'فیلڈ شامل کریں')}</button>
    <ProcessButton disabled={!fields.some((field) => field.trim())} onClick={() => run((p) => createPdfForm(files[0], fields.map((label, index) => ({ name: `field_${index + 1}`, label })), p))} label={tr('Create fillable PDF', 'Fillable PDF بنائیں')} />
  </Panel>
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
  const [color, setColor] = useState('#D92D20')
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
            {['#D92D20', '#101828', '#667085', '#2E90FA'].map((c) => (
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

export function HeicToPdfOptions({ files, run }: OptionsProps) {
  const { tr } = useI18n()
  return (
    <Panel>
      <p className="text-sm text-muted">{tr('Images are decoded locally and added one per PDF page in the order shown. Original photo metadata is not retained.', 'تصاویر اسی براؤزر میں decode ہو کر دکھائی گئی ترتیب سے PDF میں شامل ہوں گی۔ اصل photo metadata محفوظ نہیں ہوگا۔')}</p>
      <ProcessButton onClick={() => run((progress) => heicToPdf(files, progress))} label={tr('Convert to PDF', 'PDF میں تبدیل کریں')} />
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
