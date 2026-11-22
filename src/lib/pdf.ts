import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

export const MAX_BYTES = 100 * 1024 * 1024

export type Bilingual = { en: string; ur: string }
export type Output = { name: string; blob: Blob }
export type Progress = (fraction: number, label?: string) => void

export class ToolError extends Error {
  text: Bilingual
  constructor(text: Bilingual) {
    super(text.en)
    this.text = text
  }
}

const err = (en: string, ur: string) => new ToolError({ en, ur })

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

export function baseName(name: string) {
  return name.replace(/\.[^.]+$/, '') || 'document'
}

const toBlob = (bytes: Uint8Array, type = 'application/pdf') => new Blob([bytes as BlobPart], { type })

/* ---------- validation ---------- */

export type FileKind = 'pdf' | 'jpg' | 'png'

async function sniff(file: File): Promise<FileKind | null> {
  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer())
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'jpg'
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return 'png'
  const text = new TextDecoder('latin1').decode(head)
  if (text.includes('%PDF-')) return 'pdf'
  return null
}

const PDF_MIME = ['application/pdf', 'application/x-pdf', '']
const IMAGE_MIME = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', '']

export async function detectKind(file: File): Promise<FileKind | null> {
  return sniff(file)
}

export async function validateFile(file: File, accepts: 'pdf' | 'image'): Promise<FileKind> {
  if (file.size === 0) throw err(`“${file.name}” is empty.`, `“${file.name}” خالی ہے۔`)
  if (file.size > MAX_BYTES)
    throw err(`“${file.name}” is larger than 100 MB.`, `“${file.name}” 100 MB سے بڑی ہے۔`)
  const mimeOk = accepts === 'pdf' ? PDF_MIME.includes(file.type) : IMAGE_MIME.includes(file.type)
  const kind = await sniff(file)
  if (accepts === 'pdf') {
    if (!mimeOk || kind !== 'pdf')
      throw err(`“${file.name}” is not a valid PDF file.`, `“${file.name}” درست پی ڈی ایف فائل نہیں ہے۔`)
  } else if (!mimeOk || (kind !== 'jpg' && kind !== 'png')) {
    throw err(`“${file.name}” is not a JPG or PNG image.`, `“${file.name}” JPG یا PNG تصویر نہیں ہے۔`)
  }
  return kind
}

/* ---------- loaders ---------- */

const encryptedError = (name: string) =>
  err(
    `“${name}” is password-protected. Password-protected PDFs aren’t supported yet.`,
    `“${name}” پاس ورڈ سے محفوظ ہے۔ ایسی فائلیں ابھی معاون نہیں ہیں۔`,
  )

export async function loadPdf(file: File): Promise<PDFDocument> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false })
  } catch (e) {
    const msg = e instanceof Error ? `${e.name} ${e.message}` : String(e)
    if (/encrypt/i.test(msg)) throw encryptedError(file.name)
    throw err(`Couldn’t read “${file.name}”. The file may be damaged.`, `“${file.name}” پڑھی نہیں جا سکی۔ فائل خراب ہو سکتی ہے۔`)
  }
}

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null

export function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([
      import('pdfjs-dist/legacy/build/pdf.mjs'),
      import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
    ]).then(([lib, worker]) => {
      lib.GlobalWorkerOptions.workerSrc = worker.default
      return lib as unknown as typeof import('pdfjs-dist')
    })
  }
  return pdfjsPromise
}

export type PdfDoc = PDFDocumentProxy & { destroy: () => Promise<void> }

export async function openPdfjs(file: File): Promise<PdfDoc> {
  const pdfjs = await getPdfjs()
  const data = new Uint8Array(await file.arrayBuffer())
  const task = pdfjs.getDocument({ data })
  try {
    const doc = await task.promise
    return Object.assign(doc, { destroy: () => task.destroy() })
  } catch (e) {
    task.destroy()
    if (e && typeof e === 'object' && 'name' in e && (e as { name: string }).name === 'PasswordException')
      throw encryptedError(file.name)
    throw err(`Couldn’t read “${file.name}”. The file may be damaged.`, `“${file.name}” پڑھی نہیں جا سکی۔ فائل خراب ہو سکتی ہے۔`)
  }
}

const MAX_CANVAS_PIXELS = 16_000_000

export async function renderPage(page: PDFPageProxy, scale: number, background = '#ffffff') {
  let viewport = page.getViewport({ scale })
  const area = viewport.width * viewport.height
  if (area > MAX_CANVAS_PIXELS) viewport = page.getViewport({ scale: scale * Math.sqrt(MAX_CANVAS_PIXELS / area) })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw err('Your browser could not create a drawing canvas.', 'آپ کا براؤزر کینوس نہیں بنا سکا۔')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvas, canvasContext: ctx, viewport }).promise
  return { canvas, viewport }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(err('Could not encode the image.', 'تصویر نہیں بن سکی۔'))), type, quality),
  )
}

const tick = () => new Promise((r) => setTimeout(r, 0))

/* ---------- page ranges ---------- */

/** Parses "1-3, 5, 8-" into groups of zero-based page indices. */
export function parseRanges(input: string, pageCount: number): number[][] {
  const parts = input
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (!parts.length) throw err('Enter at least one page or range, e.g. 1-3, 5.', 'کم از کم ایک صفحہ یا حد لکھیں، مثلاً 1-3, 5۔')
  return parts.map((part) => {
    const m = part.match(/^(\d+)?\s*(-)?\s*(\d+)?$/)
    if (!m || (!m[1] && !m[3]))
      throw err(`“${part}” isn’t a valid page range.`, `“${part}” درست حد نہیں ہے۔`)
    const start = m[1] ? Number(m[1]) : 1
    const end = m[2] ? (m[3] ? Number(m[3]) : pageCount) : start
    if (start < 1 || end > pageCount || start > end)
      throw err(
        `“${part}” is outside pages 1–${pageCount}.`,
        `“${part}” صفحات 1–${pageCount} سے باہر ہے۔`,
      )
    return Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i)
  })
}

/* ---------- text and images ---------- */

export async function textToPng(
  text: string,
  { font, color, size }: { font: string; color: string; size: number },
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  if (document.fonts) await document.fonts.ready
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const fontSpec = `${size}px ${font}`
  ctx.font = fontSpec
  const metrics = ctx.measureText(text)
  const pad = Math.ceil(size * 0.35)
  canvas.width = Math.ceil(metrics.width + pad * 2)
  canvas.height = Math.ceil(size * 1.6 + pad)
  ctx.font = fontSpec
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(text, pad, canvas.height / 2)
  const blob = await canvasToBlob(canvas, 'image/png')
  return { bytes: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height }
}

/* ---------- tools ---------- */

export async function mergePdfs(files: File[], onProgress: Progress): Promise<Output[]> {
  if (files.length < 2) throw err('Add at least two PDFs to merge.', 'یکجا کرنے کے لیے کم از کم دو پی ڈی ایف شامل کریں۔')
  const out = await PDFDocument.create()
  for (let i = 0; i < files.length; i++) {
    onProgress(i / files.length, files[i].name)
    const src = await loadPdf(files[i])
    const pages = await out.copyPages(src, src.getPageIndices())
    pages.forEach((p) => out.addPage(p))
    await tick()
  }
  onProgress(0.97, 'Saving')
  const bytes = await out.save()
  return [{ name: 'merged.pdf', blob: toBlob(bytes) }]
}

async function copyToNew(src: PDFDocument, indices: number[]) {
  const doc = await PDFDocument.create()
  const pages = await doc.copyPages(src, indices)
  pages.forEach((p) => doc.addPage(p))
  return doc.save()
}

export async function splitPdf(
  file: File,
  opts: { mode: 'ranges' | 'every'; ranges: string },
  onProgress: Progress,
): Promise<Output[]> {
  const src = await loadPdf(file)
  const count = src.getPageCount()
  const groups = opts.mode === 'every' ? src.getPageIndices().map((i) => [i]) : parseRanges(opts.ranges, count)
  const name = baseName(file.name)
  const outputs: Output[] = []
  for (let g = 0; g < groups.length; g++) {
    onProgress(g / groups.length, `Part ${g + 1} of ${groups.length}`)
    const idx = groups[g]
    const label = idx.length === 1 ? `page-${idx[0] + 1}` : `pages-${idx[0] + 1}-${idx[idx.length - 1] + 1}`
    outputs.push({ name: `${name}-${label}.pdf`, blob: toBlob(await copyToNew(src, idx)) })
    await tick()
  }
  return outputs
}

export async function rotatePdf(file: File, angle: number, pages: number[] | 'all', onProgress: Progress) {
  const doc = await loadPdf(file)
  const targets = pages === 'all' ? doc.getPageIndices() : pages
  if (!targets.length) throw err('Select at least one page to rotate.', 'گھمانے کے لیے کم از کم ایک صفحہ منتخب کریں۔')
  targets.forEach((i, n) => {
    const page = doc.getPage(i)
    page.setRotation(degrees((page.getRotation().angle + angle) % 360))
    onProgress(n / targets.length)
  })
  onProgress(0.95, 'Saving')
  return [{ name: `${baseName(file.name)}-rotated.pdf`, blob: toBlob(await doc.save()) }]
}

export async function deletePages(file: File, remove: number[], onProgress: Progress) {
  const src = await loadPdf(file)
  const keep = src.getPageIndices().filter((i) => !remove.includes(i))
  if (!remove.length) throw err('Select the pages you want to delete.', 'وہ صفحات منتخب کریں جنہیں حذف کرنا ہے۔')
  if (!keep.length) throw err('You can’t delete every page. Keep at least one.', 'تمام صفحات حذف نہیں ہو سکتے۔ کم از کم ایک رکھیں۔')
  onProgress(0.4, 'Copying pages')
  const bytes = await copyToNew(src, keep)
  return [{ name: `${baseName(file.name)}-edited.pdf`, blob: toBlob(bytes) }]
}

export async function extractPages(file: File, pages: number[], separate: boolean, onProgress: Progress) {
  if (!pages.length) throw err('Select the pages you want to extract.', 'وہ صفحات منتخب کریں جنہیں نکالنا ہے۔')
  const src = await loadPdf(file)
  const sorted = [...pages].sort((a, b) => a - b)
  const name = baseName(file.name)
  if (!separate) {
    onProgress(0.4, 'Copying pages')
    return [{ name: `${name}-extracted.pdf`, blob: toBlob(await copyToNew(src, sorted)) }]
  }
  const outputs: Output[] = []
  for (let i = 0; i < sorted.length; i++) {
    onProgress(i / sorted.length)
    outputs.push({ name: `${name}-page-${sorted[i] + 1}.pdf`, blob: toBlob(await copyToNew(src, [sorted[i]])) })
    await tick()
  }
  return outputs
}

export async function reorderPages(file: File, order: number[], onProgress: Progress) {
  const src = await loadPdf(file)
  onProgress(0.4, 'Copying pages')
  return [{ name: `${baseName(file.name)}-reordered.pdf`, blob: toBlob(await copyToNew(src, order)) }]
}

export type NumberPosition = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'

export async function addPageNumbers(
  file: File,
  opts: { position: NumberPosition; start: number; format: 'n' | 'page-n' | 'n-of-total'; size: number },
  onProgress: Progress,
) {
  const doc = await loadPdf(file)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const pages = doc.getPages()
  const total = pages.length + opts.start - 1
  pages.forEach((page, i) => {
    const n = i + opts.start
    const text = opts.format === 'n' ? `${n}` : opts.format === 'page-n' ? `Page ${n}` : `${n} / ${total}`
    const width = font.widthOfTextAtSize(text, opts.size)
    const { x: bx, y: by, width: pw, height: ph } = page.getCropBox()
    const rotation = ((page.getRotation().angle % 360) + 360) % 360
    const margin = 24
    // Work in the page's visual frame, then map back to unrotated PDF space.
    const vw = rotation % 180 === 0 ? pw : ph
    const vh = rotation % 180 === 0 ? ph : pw
    const [vert, horiz] = opts.position.split('-') as ['top' | 'bottom', 'left' | 'center' | 'right']
    const vx = horiz === 'left' ? margin : horiz === 'right' ? vw - margin - width : (vw - width) / 2
    const vy = vert === 'top' ? vh - margin - opts.size : margin
    let x = vx
    let y = vy
    if (rotation === 90) [x, y] = [pw - vy, vx]
    else if (rotation === 180) [x, y] = [pw - vx, ph - vy]
    else if (rotation === 270) [x, y] = [vy, ph - vx]
    page.drawText(text, {
      x: bx + x,
      y: by + y,
      size: opts.size,
      font,
      color: rgb(0.2, 0.22, 0.27),
      rotate: degrees(rotation),
    })
    onProgress(i / pages.length)
  })
  onProgress(0.95, 'Saving')
  return [{ name: `${baseName(file.name)}-numbered.pdf`, blob: toBlob(await doc.save()) }]
}

export async function addWatermark(
  file: File,
  opts: { text: string; size: number; opacity: number; color: string; angle: number; tiled: boolean },
  onProgress: Progress,
) {
  if (!opts.text.trim()) throw err('Enter the watermark text.', 'واٹر مارک کا متن لکھیں۔')
  const doc = await loadPdf(file)
  // Rendered to an image so any script (including Urdu) works.
  const png = await textToPng(opts.text, {
    font: '700 "Inter", "Noto Nastaliq Urdu", sans-serif',
    color: opts.color,
    size: 200,
  })
  const image = await doc.embedPng(png.bytes)
  const pages = doc.getPages()
  pages.forEach((page, i) => {
    const { x: bx, y: by, width: pw, height: ph } = page.getCropBox()
    const h = opts.size * 1.6
    const w = (png.width / png.height) * h
    const rad = (opts.angle * Math.PI) / 180
    const place = (cx: number, cy: number) => {
      // Rotate around the image centre: pdf-lib rotates around the bottom-left corner.
      const x = cx - (w / 2) * Math.cos(rad) + (h / 2) * Math.sin(rad)
      const y = cy - (w / 2) * Math.sin(rad) - (h / 2) * Math.cos(rad)
      page.drawImage(image, { x, y, width: w, height: h, opacity: opts.opacity, rotate: degrees(opts.angle) })
    }
    if (opts.tiled) {
      const stepX = Math.max(w * 0.9, 160)
      const stepY = Math.max(h * 3, 120)
      for (let cy = by + stepY / 2; cy < by + ph + stepY; cy += stepY)
        for (let cx = bx + stepX / 2; cx < bx + pw + stepX; cx += stepX) place(cx, cy)
    } else {
      place(bx + pw / 2, by + ph / 2)
    }
    onProgress(i / pages.length)
  })
  onProgress(0.95, 'Saving')
  return [{ name: `${baseName(file.name)}-watermarked.pdf`, blob: toBlob(await doc.save()) }]
}

export type Placement = { pageIndex: number; left: number; top: number; width: number; height: number }

/** Places a PNG signature. Box is given as fractions of the rendered (rotated) page. */
export async function signPdf(file: File, png: Uint8Array, place: Placement, onProgress: Progress) {
  onProgress(0.1, 'Reading page')
  const pdf = await openPdfjs(file)
  const jsPage = await pdf.getPage(place.pageIndex + 1)
  const vp = jsPage.getViewport({ scale: 1 })
  const toPdf = (fx: number, fy: number) => vp.convertToPdfPoint(fx * vp.width, fy * vp.height) as [number, number]
  const bl = toPdf(place.left, place.top + place.height)
  const br = toPdf(place.left + place.width, place.top + place.height)
  const tl = toPdf(place.left, place.top)
  await pdf.destroy()

  onProgress(0.4, 'Placing signature')
  const doc = await loadPdf(file)
  const image = await doc.embedPng(png)
  const page = doc.getPage(place.pageIndex)
  const width = Math.hypot(br[0] - bl[0], br[1] - bl[1])
  const height = Math.hypot(tl[0] - bl[0], tl[1] - bl[1])
  const angle = (Math.atan2(br[1] - bl[1], br[0] - bl[0]) * 180) / Math.PI
  page.drawImage(image, { x: bl[0], y: bl[1], width, height, rotate: degrees(angle) })
  onProgress(0.9, 'Saving')
  return [{ name: `${baseName(file.name)}-signed.pdf`, blob: toBlob(await doc.save()) }]
}

export async function imagesToPdf(
  files: File[],
  opts: { pageSize: 'fit' | 'a4' | 'letter'; orientation: 'portrait' | 'landscape' | 'auto'; margin: number },
  onProgress: Progress,
) {
  if (!files.length) throw err('Add at least one image.', 'کم از کم ایک تصویر شامل کریں۔')
  const doc = await PDFDocument.create()
  const sizes: Record<'a4' | 'letter', [number, number]> = { a4: [595.28, 841.89], letter: [612, 792] }
  for (let i = 0; i < files.length; i++) {
    onProgress(i / files.length, files[i].name)
    const kind = await detectKind(files[i])
    const bytes = new Uint8Array(await files[i].arrayBuffer())
    let image
    try {
      image = kind === 'png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
    } catch {
      throw err(`Couldn’t read the image “${files[i].name}”.`, `تصویر “${files[i].name}” پڑھی نہیں جا سکی۔`)
    }
    if (opts.pageSize === 'fit') {
      const page = doc.addPage([image.width + opts.margin * 2, image.height + opts.margin * 2])
      page.drawImage(image, { x: opts.margin, y: opts.margin, width: image.width, height: image.height })
    } else {
      let [pw, ph] = sizes[opts.pageSize]
      const landscape = opts.orientation === 'landscape' || (opts.orientation === 'auto' && image.width > image.height)
      if (landscape) [pw, ph] = [ph, pw]
      const page = doc.addPage([pw, ph])
      const maxW = pw - opts.margin * 2
      const maxH = ph - opts.margin * 2
      const s = Math.min(maxW / image.width, maxH / image.height)
      const w = image.width * s
      const h = image.height * s
      page.drawImage(image, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h })
    }
    await tick()
  }
  onProgress(0.97, 'Saving')
  const name = files.length === 1 ? `${baseName(files[0].name)}.pdf` : 'images.pdf'
  return [{ name, blob: toBlob(await doc.save()) }]
}

export async function pdfToJpg(file: File, opts: { dpi: number; quality: number }, onProgress: Progress) {
  const pdf = await openPdfjs(file)
  const name = baseName(file.name)
  const outputs: Output[] = []
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress((i - 1) / pdf.numPages, `Page ${i} of ${pdf.numPages}`)
      const page = await pdf.getPage(i)
      const { canvas } = await renderPage(page, opts.dpi / 72)
      outputs.push({ name: `${name}-page-${i}.jpg`, blob: await canvasToBlob(canvas, 'image/jpeg', opts.quality) })
      canvas.width = 0
      page.cleanup()
    }
  } finally {
    await pdf.destroy()
  }
  return outputs
}

export async function compressPdf(file: File, opts: { dpi: number; quality: number }, onProgress: Progress) {
  const pdf = await openPdfjs(file)
  const out = await PDFDocument.create()
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress((i - 1) / pdf.numPages, `Page ${i} of ${pdf.numPages}`)
      const page = await pdf.getPage(i)
      const size = page.getViewport({ scale: 1 })
      const { canvas } = await renderPage(page, opts.dpi / 72)
      const jpg = await canvasToBlob(canvas, 'image/jpeg', opts.quality)
      canvas.width = 0
      page.cleanup()
      const image = await out.embedJpg(new Uint8Array(await jpg.arrayBuffer()))
      const newPage = out.addPage([size.width, size.height])
      newPage.drawImage(image, { x: 0, y: 0, width: size.width, height: size.height })
    }
  } finally {
    await pdf.destroy()
  }
  onProgress(0.97, 'Saving')
  const bytes = await out.save()
  return [{ name: `${baseName(file.name)}-compressed.pdf`, blob: toBlob(bytes) }]
}

export async function zipOutputs(outputs: Output[], zipName: string): Promise<Output> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const used = new Set<string>()
  for (const o of outputs) {
    let n = o.name
    for (let k = 2; used.has(n); k++) n = o.name.replace(/(\.[^.]+)?$/, `-${k}$1`)
    used.add(n)
    zip.file(n, o.blob)
  }
  return { name: zipName, blob: await zip.generateAsync({ type: 'blob' }) }
}

export function downloadBlob({ name, blob }: Output) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
