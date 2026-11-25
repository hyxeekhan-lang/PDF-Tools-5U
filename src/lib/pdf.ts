import { PDFArray, PDFDocument, PDFName, PDFString, StandardFonts, degrees, rgb } from 'pdf-lib'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

export const MAX_BYTES = 100 * 1024 * 1024
const MAX_CANVAS_PIXELS = 16_000_000
const MAX_EXTRACTED_IMAGES = 500
const MAX_EXTRACTED_PIXELS = 32_000_000

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
export type AcceptedInput = 'pdf' | 'image' | 'heic' | 'text' | 'docx' | 'xlsx' | 'pptx' | 'html'

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

export async function validateFile(file: File, accepts: AcceptedInput): Promise<FileKind | AcceptedInput> {
  if (file.size === 0) throw err(`“${file.name}” is empty.`, `“${file.name}” خالی ہے۔`)
  if (file.size > MAX_BYTES)
    throw err(`“${file.name}” is larger than 100 MB.`, `“${file.name}” 100 MB سے بڑی ہے۔`)
  if (accepts === 'text') {
    if (!/\.txt$/i.test(file.name) || (file.type && file.type !== 'text/plain'))
      throw err(`“${file.name}” is not a plain text (.txt) file.`, `“${file.name}” سادہ text (.txt) فائل نہیں ہے۔`)
    return 'text'
  }
  if (accepts === 'html') {
    if (!/\.(html?|xhtml)$/i.test(file.name) || (file.type && !['text/html', 'application/xhtml+xml'].includes(file.type)))
      throw err(`“${file.name}” is not an HTML file.`, `“${file.name}” HTML فائل نہیں ہے۔`)
    return 'html'
  }
  if (accepts === 'heic') {
    const signature = new TextDecoder('latin1').decode(await file.slice(0, 40).arrayBuffer())
    const hasHeifBrand = signature.slice(4, 8) === 'ftyp' && /\b(?:heic|heix|hevc|hevx|mif1|msf1|heis|hevm)\b/.test(signature.slice(8))
    const hasHeifMime = ['', 'image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'].includes(file.type)
    if (!/\.(heic|heif)$/i.test(file.name) || !hasHeifMime || !hasHeifBrand)
      throw err(`“${file.name}” is not a valid HEIC/HEIF image.`, `“${file.name}” درست HEIC/HEIF تصویر نہیں ہے۔`)
    return 'heic'
  }
  if (accepts === 'docx' || accepts === 'xlsx' || accepts === 'pptx') {
    const extension = accepts === 'docx' ? /\.docx$/i : accepts === 'xlsx' ? /\.xlsx$/i : /\.pptx$/i
    const head = new Uint8Array(await file.slice(0, 4).arrayBuffer())
    if (!extension.test(file.name) || head[0] !== 0x50 || head[1] !== 0x4b)
      throw err(`“${file.name}” is not a valid ${accepts.toUpperCase()} archive.`, `“${file.name}” درست ${accepts.toUpperCase()} فائل نہیں ہے۔`)
    const requiredPart = accepts === 'docx' ? 'word/document.xml' : accepts === 'xlsx' ? 'xl/workbook.xml' : 'ppt/presentation.xml'
    try {
      const { default: JSZip } = await import('jszip')
      const archive = await JSZip.loadAsync(await file.arrayBuffer())
      if (!archive.file(requiredPart)) throw new Error('Missing document part')
    } catch {
      throw err(`“${file.name}” is not a readable ${accepts.toUpperCase()} document.`, `“${file.name}” قابلِ مطالعہ ${accepts.toUpperCase()} دستاویز نہیں ہے۔`)
    }
    return accepts
  }
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

export async function protectPdf(file: File, password: string, onProgress: Progress) {
  if (password.length < 8) throw err('Use a password with at least 8 characters.', 'کم از کم 8 حروف کا پاس ورڈ استعمال کریں۔')
  if (password.length > 127) throw err('Keep the password to 127 characters or fewer.', 'پاس ورڈ 127 حروف یا اس سے کم رکھیں۔')
  const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt')
  const { isEncrypted } = await import('@pdfsmaller/pdf-decrypt')
  const bytes = new Uint8Array(await file.arrayBuffer())
  try {
    if ((await isEncrypted(bytes)).encrypted)
      throw err('This PDF is already password-protected. Unlock it before adding a new password.', 'یہ PDF پہلے سے پاس ورڈ سے محفوظ ہے۔ نیا پاس ورڈ لگانے سے پہلے اسے unlock کریں۔')
    onProgress(0.35, 'Applying AES-256 encryption')
    const ownerPassword = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, '0')).join('')
    const encrypted = await encryptPDF(bytes, password, { ownerPassword, algorithm: 'AES-256' })
    onProgress(0.95, 'Saving encrypted PDF')
    return [{ name: `${baseName(file.name)}-protected.pdf`, blob: toBlob(encrypted) }]
  } catch (cause) {
    if (cause instanceof ToolError) throw cause
    throw err('Could not protect this PDF. It may be damaged or use unsupported encryption features.', 'اس PDF کو محفوظ نہیں کیا جا سکا۔ فائل خراب یا غیر معاون encryption والی ہو سکتی ہے۔')
  }
}

export async function unlockPdf(file: File, password: string, onProgress: Progress) {
  if (!password) throw err('Enter the PDF password.', 'PDF کا پاس ورڈ درج کریں۔')
  const { decryptPDF } = await import('@pdfsmaller/pdf-decrypt')
  const bytes = new Uint8Array(await file.arrayBuffer())
  onProgress(0.2, 'Checking password')
  try {
    const decrypted = await decryptPDF(bytes, password)
    const document = await PDFDocument.load(decrypted, { updateMetadata: false })
    if (!document.getPageCount()) throw err('The unlocked PDF has no pages.', 'Unlock کی گئی PDF میں صفحات نہیں ہیں۔')
    onProgress(0.95, 'Saving unlocked PDF')
    return [{ name: `${baseName(file.name)}-unlocked.pdf`, blob: toBlob(decrypted) }]
  } catch (cause) {
    if (cause instanceof ToolError) throw cause
    const message = cause instanceof Error ? cause.message : ''
    if (/incorrect password|invalid password|password.*incorrect/i.test(message))
      throw err('That password is incorrect.', 'یہ پاس ورڈ درست نہیں ہے۔')
    if (/not encrypted/i.test(message))
      throw err('This PDF is not password-protected.', 'یہ PDF پاس ورڈ سے محفوظ نہیں ہے۔')
    if (/unsupported encryption/i.test(message))
      throw err('This PDF uses an unsupported encryption method.', 'اس PDF میں غیر معاون encryption طریقہ استعمال ہوا ہے۔')
    throw err('Could not unlock this PDF. It may be damaged or use unsupported encryption features.', 'اس PDF کو unlock نہیں کیا جا سکا۔ فائل خراب یا غیر معاون encryption والی ہو سکتی ہے۔')
  }
}

/* ---------- loaders ---------- */

const encryptedError = (name: string) =>
  err(
    `“${name}” is password-protected. Use Unlock PDF first, then retry this tool.`,
    `“${name}” پاس ورڈ سے محفوظ ہے۔ پہلے Unlock PDF استعمال کریں، پھر یہ ٹول دوبارہ چلائیں۔`,
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

type PdfImageObject = {
  width: number
  height: number
  data?: Uint8Array | Uint8ClampedArray
  kind?: number
  bitmap?: ImageBitmap
}

function imageObjectAsCanvas(image: PdfImageObject, imageKinds: typeof import('pdfjs-dist').ImageKind) {
  const { width, height } = image
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width * height > MAX_CANVAS_PIXELS)
    throw err('A PDF image has unsupported dimensions.', 'PDF تصویر کے سائز کی معاونت نہیں ہے۔')

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw err('Your browser could not create an image canvas.', 'آپ کا براؤزر تصویر کا کینوس نہیں بنا سکا۔')

  if (image.bitmap) {
    context.drawImage(image.bitmap, 0, 0)
    return canvas
  }

  const source = image.data
  if (!source) throw err('A PDF image could not be decoded.', 'PDF تصویر decode نہیں ہو سکی۔')

  const rgba = new Uint8ClampedArray(width * height * 4)
  if (image.kind === imageKinds.RGBA_32BPP && source.length === rgba.length) {
    rgba.set(source)
  } else if (image.kind === imageKinds.RGB_24BPP && source.length === width * height * 3) {
    for (let sourceIndex = 0, targetIndex = 0; targetIndex < rgba.length; sourceIndex += 3, targetIndex += 4) {
      rgba[targetIndex] = source[sourceIndex]
      rgba[targetIndex + 1] = source[sourceIndex + 1]
      rgba[targetIndex + 2] = source[sourceIndex + 2]
      rgba[targetIndex + 3] = 255
    }
  } else if (image.kind === imageKinds.GRAYSCALE_1BPP) {
    const rowBytes = Math.ceil(width / 8)
    if (source.length < rowBytes * height) throw err('A PDF image could not be decoded.', 'PDF تصویر decode نہیں ہو سکی۔')
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const shade = source[y * rowBytes + (x >> 3)] & (1 << (7 - (x & 7))) ? 255 : 0
        const targetIndex = (y * width + x) * 4
        rgba[targetIndex] = shade
        rgba[targetIndex + 1] = shade
        rgba[targetIndex + 2] = shade
        rgba[targetIndex + 3] = 255
      }
    }
  } else {
    throw err('A PDF image uses an unsupported pixel format.', 'PDF تصویر کا pixel format معاونت یافتہ نہیں۔')
  }

  context.putImageData(new ImageData(rgba, width, height), 0, 0)
  return canvas
}

function getPdfImageObject(page: PDFPageProxy, objectId: string): Promise<PdfImageObject> {
  const objects = page.objs.has(objectId) ? page.objs : page.commonObjs
  return new Promise((resolve, reject) => {
    try {
      objects.get(objectId, resolve, reject)
    } catch (error) {
      reject(error)
    }
  })
}

export async function extractPdfImages(file: File, onProgress: Progress): Promise<Output[]> {
  const document = await openPdfjs(file)
  const pdfjs = await getPdfjs()
  const outputs: Output[] = []
  let extractedPixels = 0
  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber)
      const operators = await page.getOperatorList()
      const seenObjects = new Set<string>()
      let pageImageIndex = 0
      for (let index = 0; index < operators.fnArray.length; index++) {
        const operation = operators.fnArray[index]
        const args = operators.argsArray[index]
        const isIndirectImage =
          operation === pdfjs.OPS.paintImageXObject ||
          operation === pdfjs.OPS.paintImageXObjectRepeat
        const isInlineImage = operation === pdfjs.OPS.paintInlineImageXObject
        if (!isIndirectImage && !isInlineImage) continue

        const objectId = isIndirectImage ? args[0] as string : null
        if (objectId && seenObjects.has(objectId)) continue
        if (objectId) seenObjects.add(objectId)

        let image: PdfImageObject
        try {
          image = objectId ? await getPdfImageObject(page, objectId) : args[0] as PdfImageObject
        } catch {
          throw err('A PDF image could not be decoded.', 'PDF تصویر decode نہیں ہو سکی۔')
        }
        extractedPixels += image.width * image.height
        if (outputs.length >= MAX_EXTRACTED_IMAGES || extractedPixels > MAX_EXTRACTED_PIXELS)
          throw err('This PDF contains too many or too-large images to export safely in one batch.', 'اس PDF میں تصاویر کی تعداد یا سائز ایک محفوظ batch سے زیادہ ہے۔')
        const canvas = imageObjectAsCanvas(image, pdfjs.ImageKind)
        const blob = await canvasToBlob(canvas, 'image/png')
        canvas.width = 0
        canvas.height = 0
        outputs.push({
          name: `${baseName(file.name)}-page-${pageNumber}-image-${++pageImageIndex}.png`,
          blob,
        })
      }
      onProgress(pageNumber / document.numPages, `Page ${pageNumber} of ${document.numPages}`)
    }
  } finally {
    await document.destroy()
  }

  if (!outputs.length) throw err('No extractable embedded images were found in this PDF.', 'اس PDF میں نکالنے کے قابل کوئی embedded تصاویر نہیں ملیں۔')
  return outputs
}

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

export async function drawOnPdf(file: File, png: Uint8Array, place: Placement, onProgress: Progress) {
  const outputs = await signPdf(file, png, place, onProgress)
  return outputs.map((output) => ({ ...output, name: `${baseName(file.name)}-drawn.pdf` }))
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

export async function heicToPdf(files: File[], onProgress: Progress) {
  if (!files.length) throw err('Add at least one HEIC/HEIF image.', 'کم از کم ایک HEIC/HEIF تصویر شامل کریں۔')
  const { default: heic2any } = await import('heic2any')
  const converted: File[] = []
  for (let index = 0; index < files.length; index++) {
    const source = files[index]
    let result: Blob | Blob[]
    try {
      result = await heic2any({ blob: source, toType: 'image/png', quality: 0.92, multiple: true })
    } catch {
      throw err(`Couldn’t decode “${source.name}”. The HEIC/HEIF file may be damaged or use an unsupported codec.`, `“${source.name}” نہیں کھلی۔ HEIC/HEIF فائل خراب یا غیر معاون codec والی ہو سکتی ہے۔`)
    }
    const images = Array.isArray(result) ? result : [result]
    for (let frame = 0; frame < images.length; frame++) {
      if (images[frame].type !== 'image/png' || images[frame].size === 0)
        throw err(`Couldn’t convert “${source.name}” to a usable image.`, `“${source.name}” کو قابلِ استعمال تصویر میں تبدیل نہیں کیا جا سکا۔`)
      const suffix = images.length > 1 ? `-frame-${frame + 1}` : ''
      converted.push(new File([images[frame]], `${baseName(source.name)}${suffix}.png`, { type: 'image/png' }))
    }
    onProgress(((index + 1) / files.length) * 0.2, `Decoded ${index + 1} of ${files.length} images`)
  }
  const outputs = await imagesToPdf(converted, { pageSize: 'fit', orientation: 'auto', margin: 0 }, (fraction, label) =>
    onProgress(0.2 + fraction * 0.8, label),
  )
  const outputName = files.length === 1 ? `${baseName(files[0].name)}.pdf` : 'heic-images.pdf'
  return outputs.map((output) => ({ ...output, name: outputName }))
}

export async function textToPdf(file: File, onProgress: Progress) {
  const text = (await file.text()).replace(/\r\n?/g, '\n')
  return textContentToPdf(text, `${baseName(file.name)}.pdf`, onProgress)
}

async function textContentToPdf(text: string, outputName: string, onProgress: Progress) {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontSize = 11
  const lineHeight = 15
  const margin = 48
  const pageSize: [number, number] = [612, 792]
  const maxWidth = pageSize[0] - margin * 2
  const lines: string[] = []
  for (const rawLine of text.split('\n')) {
    let line = ''
    for (const word of rawLine.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word
      try {
        font.encodeText(candidate)
      } catch {
        throw err('This text file contains characters not supported by the built-in Latin font.', 'اس text فائل میں ایسے حروف ہیں جو built-in Latin font میں معاون نہیں۔')
      }
      if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    }
    lines.push(line)
  }
  const linesPerPage = Math.floor((pageSize[1] - margin * 2) / lineHeight)
  const pageCount = Math.max(1, Math.ceil(lines.length / linesPerPage))
  for (let p = 0; p < pageCount; p++) {
    const page = doc.addPage(pageSize)
    lines.slice(p * linesPerPage, (p + 1) * linesPerPage).forEach((line, index) => {
      page.drawText(line, { x: margin, y: pageSize[1] - margin - fontSize - index * lineHeight, size: fontSize, font })
    })
    onProgress((p + 1) / pageCount, `Page ${p + 1} of ${pageCount}`)
    await tick()
  }
  return [{ name: outputName, blob: toBlob(await doc.save()) }]
}

async function readOfficeXml(file: File, expectedPath: string) {
  const { default: JSZip } = await import('jszip')
  try {
    const zip = await JSZip.loadAsync(await file.arrayBuffer())
    const entry = zip.file(expectedPath)
    if (!entry) throw new Error('Required document part was not found.')
    return { zip, xml: await entry.async('string') }
  } catch {
    throw err(`Couldn’t read “${file.name}” as a valid Office document.`, `“${file.name}” درست Office فائل کے طور پر نہیں پڑھی جا سکی۔`)
  }
}

function parseXml(xml: string, fileName: string) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror')) throw err(`Couldn’t parse “${fileName}”.`, `“${fileName}” کا XML نہیں پڑھا جا سکا۔`)
  return doc
}

export async function wordToPdf(file: File, onProgress: Progress) {
  const { xml } = await readOfficeXml(file, 'word/document.xml')
  const doc = parseXml(xml, file.name)
  const paragraphs = Array.from(doc.getElementsByTagNameNS('*', 'p'))
    .map((paragraph) => Array.from(paragraph.getElementsByTagNameNS('*', 't')).map((node) => node.textContent ?? '').join(''))
    .filter(Boolean)
  return textContentToPdf(paragraphs.join('\n'), `${baseName(file.name)}.pdf`, onProgress)
}

export async function excelToPdf(file: File, onProgress: Progress) {
  const { zip } = await readOfficeXml(file, 'xl/workbook.xml')
  const sharedEntry = zip.file('xl/sharedStrings.xml')
  const shared = sharedEntry
    ? Array.from(parseXml(await sharedEntry.async('string'), file.name).getElementsByTagNameNS('*', 'si')).map((item) =>
        Array.from(item.getElementsByTagNameNS('*', 't')).map((node) => node.textContent ?? '').join(''),
      )
    : []
  const sheetPaths = Object.keys(zip.files).filter((path) => /^xl\/worksheets\/sheet\d+\.xml$/.test(path)).sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]))
  if (!sheetPaths.length) throw err('This workbook contains no readable worksheets.', 'اس workbook میں پڑھنے کے قابل worksheets نہیں ہیں۔')
  const rows: string[] = []
  for (let sheetIndex = 0; sheetIndex < sheetPaths.length; sheetIndex++) {
    const entry = zip.file(sheetPaths[sheetIndex])
    if (!entry) continue
    const sheet = parseXml(await entry.async('string'), file.name)
    rows.push(`Sheet ${sheetIndex + 1}`)
    for (const row of Array.from(sheet.getElementsByTagNameNS('*', 'row'))) {
      const values = Array.from(row.getElementsByTagNameNS('*', 'c')).map((cell) => {
        const type = cell.getAttribute('t')
        const value = cell.getElementsByTagNameNS('*', type === 'inlineStr' ? 't' : 'v')[0]?.textContent ?? ''
        return type === 's' ? shared[Number(value)] ?? '' : value
      })
      if (values.some(Boolean)) rows.push(values.join(' | '))
    }
    onProgress((sheetIndex + 1) / sheetPaths.length, `Sheet ${sheetIndex + 1}`)
  }
  return textContentToPdf(rows.join('\n'), `${baseName(file.name)}.pdf`, onProgress)
}

export async function powerpointToPdf(file: File, onProgress: Progress) {
  const { zip } = await readOfficeXml(file, 'ppt/presentation.xml')
  const slides = Object.keys(zip.files).filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path)).sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0]))
  if (!slides.length) throw err('This presentation contains no readable slides.', 'اس presentation میں پڑھنے کے قابل slides نہیں ہیں۔')
  const text: string[] = []
  for (let index = 0; index < slides.length; index++) {
    const entry = zip.file(slides[index])
    if (!entry) continue
    const slide = parseXml(await entry.async('string'), file.name)
    const paragraphs = Array.from(slide.getElementsByTagNameNS('*', 'p'))
      .map((paragraph) => Array.from(paragraph.getElementsByTagNameNS('*', 't')).map((node) => node.textContent ?? '').join(''))
      .filter(Boolean)
    text.push(`Slide ${index + 1}`, ...paragraphs, '')
    onProgress((index + 1) / slides.length, `Slide ${index + 1}`)
  }
  return textContentToPdf(text.join('\n'), `${baseName(file.name)}.pdf`, onProgress)
}

export async function htmlToPdf(file: File, onProgress: Progress) {
  const parsed = new DOMParser().parseFromString(await file.text(), 'text/html')
  parsed.querySelectorAll('script,style,noscript,template,iframe,object,embed').forEach((node) => node.remove())
  const text = (parsed.body.textContent ?? '').replace(/\s+/g, ' ').trim()
  if (!text) throw err('No readable text was found in this HTML file.', 'اس HTML فائل میں پڑھنے کے قابل متن نہیں ملا۔')
  onProgress(0.5, 'Extracting HTML text')
  return textContentToPdf(text, `${baseName(file.name)}.pdf`, onProgress)
}

export async function addImageToPdf(file: File, imageFile: File, onProgress: Progress) {
  const kind = await validateFile(imageFile, 'image')
  const doc = await loadPdf(file)
  const bytes = new Uint8Array(await imageFile.arrayBuffer())
  let image
  try {
    image = kind === 'png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
  } catch {
    throw err(`Couldn’t read the image “${imageFile.name}”.`, `تصویر “${imageFile.name}” پڑھی نہیں جا سکی۔`)
  }
  const pages = doc.getPages()
  pages.forEach((page, index) => {
    const { width, height } = page.getSize()
    const scale = Math.min(width * 0.4 / image.width, height * 0.4 / image.height)
    const imageWidth = image.width * scale
    const imageHeight = image.height * scale
    page.drawImage(image, { x: (width - imageWidth) / 2, y: (height - imageHeight) / 2, width: imageWidth, height: imageHeight })
    onProgress((index + 1) / pages.length)
  })
  return [{ name: `${baseName(file.name)}-with-image.pdf`, blob: toBlob(await doc.save()) }]
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

export async function duplicatePages(file: File, pages: number[], onProgress: Progress) {
  if (!pages.length) throw err('Select at least one page to duplicate.', 'کم از کم ایک صفحہ منتخب کریں۔')
  const src = await loadPdf(file)
  const srcIndices = src.getPageIndices()
  const out = await PDFDocument.create()
  const copied = await out.copyPages(src, srcIndices)
  copied.forEach((page) => out.addPage(page))
  for (let i = 0; i < pages.length; i++) {
    onProgress((i + 1) / (pages.length + 1), `Duplicating page ${pages[i] + 1}`)
    const [page] = await out.copyPages(src, [pages[i]])
    out.insertPage(out.getPageCount(), page)
  }
  onProgress(0.97, 'Saving')
  return [{ name: `${baseName(file.name)}-duplicated.pdf`, blob: toBlob(await out.save()) }]
}

export async function removeMetadata(file: File, onProgress: Progress) {
  const doc = await loadPdf(file)
  doc.context.trailerInfo.Info = undefined
  doc.catalog.delete(PDFName.of('Metadata'))
  onProgress(0.9, 'Removing document metadata')
  return [{ name: `${baseName(file.name)}-clean.pdf`, blob: toBlob(await doc.save()) }]
}

export async function updateMetadata(file: File, metadata: { title: string; author: string; subject: string; keywords: string }, onProgress: Progress) {
  const doc = await loadPdf(file)
  doc.setTitle(metadata.title.trim())
  doc.setAuthor(metadata.author.trim())
  doc.setSubject(metadata.subject.trim())
  doc.setKeywords(metadata.keywords.split(',').map((word) => word.trim()).filter(Boolean))
  onProgress(0.9, 'Saving metadata')
  return [{ name: `${baseName(file.name)}-metadata.pdf`, blob: toBlob(await doc.save()) }]
}

export async function pdfToText(file: File, onProgress: Progress) {
  const pdf = await openPdfjs(file)
  const sections: string[] = []
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress((i - 1) / pdf.numPages, `Page ${i} of ${pdf.numPages}`)
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      sections.push(`--- Page ${i} ---\n${text}`)
      page.cleanup()
    }
  } finally {
    await pdf.destroy()
  }
  onProgress(1, 'Saving')
  return [{ name: `${baseName(file.name)}.txt`, blob: new Blob([sections.join('\n\n')], { type: 'text/plain;charset=utf-8' }) }]
}

export async function compressPdf(file: File, opts: { dpi: number; quality: number }, onProgress: Progress) {
  const pdf = await openPdfjs(file)
  const out = await PDFDocument.create()
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress((i - 1) / pdf.numPages, `Compressing page ${i} of ${pdf.numPages}`)
      const sourcePage = await pdf.getPage(i)
      const { canvas, viewport } = await renderPage(sourcePage, opts.dpi / 72)
      const jpg = await canvasToBlob(canvas, 'image/jpeg', opts.quality)
      const image = await out.embedJpg(new Uint8Array(await jpg.arrayBuffer()))
      const page = out.addPage([viewport.width / (opts.dpi / 72), viewport.height / (opts.dpi / 72)])
      page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() })
      canvas.width = 0
      sourcePage.cleanup()
      await tick()
    }
  } finally {
    await pdf.destroy()
  }
  onProgress(0.97, 'Saving')
  const bytes = await out.save({ useObjectStreams: true })
  return [{ name: `${baseName(file.name)}-compressed.pdf`, blob: toBlob(bytes) }]
}

export async function repairPdf(file: File, onProgress: Progress) {
  const pdf = await openPdfjs(file)
  const out = await PDFDocument.create()
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress((i - 1) / pdf.numPages, `Recovering page ${i} of ${pdf.numPages}`)
      const sourcePage = await pdf.getPage(i)
      const { canvas } = await renderPage(sourcePage, 1.5)
      const image = await out.embedJpg(new Uint8Array(await (await canvasToBlob(canvas, 'image/jpeg', 0.9)).arrayBuffer()))
      const viewport = sourcePage.getViewport({ scale: 1 })
      const page = out.addPage([viewport.width, viewport.height])
      page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() })
      canvas.width = 0
      sourcePage.cleanup()
      await tick()
    }
  } finally {
    await pdf.destroy()
  }
  onProgress(0.97, 'Saving recovered pages')
  return [{ name: `${baseName(file.name)}-repaired.pdf`, blob: toBlob(await out.save({ useObjectStreams: true })) }]
}

export async function ocrPdf(file: File, dpi: number, onProgress: Progress) {
  if (!Number.isFinite(dpi) || dpi < 100 || dpi > 250)
    throw err('Choose an OCR resolution between 100 and 250 DPI.', 'OCR کے لیے 100 سے 250 DPI کے درمیان ریزولوشن منتخب کریں۔')
  const { createWorker } = await import('tesseract.js')
  let worker
  try {
    worker = await createWorker('eng', 1, {
      logger: (message) => {
        if (message.status !== 'recognizing text') onProgress(Math.min(message.progress * 0.1, 0.1), 'Loading English OCR')
      },
    })
  } catch {
    throw err('Could not start OCR. Check your connection so the English OCR model can be downloaded.', 'OCR شروع نہیں ہو سکا۔ English OCR model ڈاؤن لوڈ کرنے کے لیے انٹرنیٹ کنکشن چیک کریں۔')
  }

  let pdf: PdfDoc | undefined
  const output = await PDFDocument.create()
  const font = await output.embedFont(StandardFonts.Helvetica)
  let recognizedWords = 0
  try {
    pdf = await openPdfjs(file)
    for (let index = 1; index <= pdf.numPages; index++) {
      onProgress(0.1 + ((index - 1) / pdf.numPages) * 0.85, `Recognizing page ${index} of ${pdf.numPages}`)
      const sourcePage = await pdf.getPage(index)
      const dimensions = sourcePage.getViewport({ scale: 1 })
      const { canvas } = await renderPage(sourcePage, dpi / 72)
      const image = await output.embedJpg(new Uint8Array(await (await canvasToBlob(canvas, 'image/jpeg', 0.92)).arrayBuffer()))
      const page = output.addPage([dimensions.width, dimensions.height])
      page.drawImage(image, { x: 0, y: 0, width: dimensions.width, height: dimensions.height })
      let result
      try {
        result = await worker.recognize(canvas, {}, { blocks: true, text: true })
      } catch {
        throw err(`OCR failed on page ${index}.`, `صفحہ ${index} پر OCR ناکام ہوا۔`)
      }
      const words = result.data.blocks?.flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines.flatMap((line) => line.words))) ?? []
      for (const word of words) {
        const text = word.text.trim()
        if (!text || word.bbox.x1 <= word.bbox.x0 || word.bbox.y1 <= word.bbox.y0) continue
        const scaleX = dimensions.width / canvas.width
        const scaleY = dimensions.height / canvas.height
        const x = Math.max(0, word.bbox.x0 * scaleX)
        const y = Math.max(0, dimensions.height - word.bbox.y1 * scaleY)
        const size = Math.max(3, (word.bbox.y1 - word.bbox.y0) * scaleY * 0.85)
        try {
          font.encodeText(text)
          page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0), opacity: 0, maxWidth: dimensions.width - x })
          recognizedWords++
        } catch {
          continue
        }
      }
      canvas.width = 0
      sourcePage.cleanup()
      await tick()
    }
  } finally {
    if (pdf) await pdf.destroy()
    await worker.terminate()
  }
  if (recognizedWords === 0) throw err('No English text could be recognized in this PDF.', 'اس PDF میں کوئی English متن شناخت نہیں ہوا۔')
  onProgress(0.98, 'Saving searchable PDF')
  return [{ name: `${baseName(file.name)}-ocr.pdf`, blob: toBlob(await output.save({ useObjectStreams: true })) }]
}

export async function flattenPdf(file: File, onProgress: Progress) {
  const doc = await loadPdf(file)
  const form = doc.getForm()
  if (form.getFields().length === 0) throw err('This PDF contains no interactive form fields to flatten.', 'اس PDF میں flatten کرنے کے لیے کوئی فارم فیلڈ نہیں۔')
  onProgress(0.6, 'Flattening form fields')
  form.flatten()
  return [{ name: `${baseName(file.name)}-flattened.pdf`, blob: toBlob(await doc.save()) }]
}

export async function optimizePdf(file: File, onProgress: Progress) {
  onProgress(0.2, 'Reading PDF')
  const doc = await loadPdf(file)
  onProgress(0.75, 'Optimizing PDF structure')
  const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false })
  return [{ name: `${baseName(file.name)}-optimized.pdf`, blob: toBlob(bytes) }]
}

export async function addTextToPdf(file: File, text: string, size: number, onProgress: Progress) {
  const value = text.trim()
  if (!value) throw err('Enter the text to add.', 'شامل کرنے کے لیے متن لکھیں۔')
  const doc = await loadPdf(file)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  try {
    font.encodeText(value)
  } catch {
    throw err('This text contains characters unsupported by the built-in font. Use basic Latin characters.', 'اس متن میں ایسے حروف ہیں جو built-in font میں موجود نہیں۔')
  }
  const pages = doc.getPages()
  pages.forEach((page, index) => {
    page.drawText(value, { x: 36, y: 36, size, font, color: rgb(0.12, 0.12, 0.16), maxWidth: page.getWidth() - 72 })
    onProgress((index + 1) / pages.length)
  })
  return [{ name: `${baseName(file.name)}-edited.pdf`, blob: toBlob(await doc.save()) }]
}

export async function addLinkPreviewToPdf(file: File, url: string, onProgress: Progress) {
  const value = url.trim()
  if (!/^https?:\/\/[^\s]+$/i.test(value)) throw err('Enter a valid http or https URL.', 'درست http یا https URL درج کریں۔')
  const doc = await loadPdf(file)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const pages = doc.getPages()
  pages.forEach((page, index) => {
    const width = Math.min(260, page.getWidth() - 72)
    const height = 48
    const x = 36
    const y = 36
    page.drawRectangle({ x, y, width, height, color: rgb(0.96, 0.97, 1), borderColor: rgb(0.85, 0.88, 0.94), borderWidth: 1 })
    page.drawText('OPEN LINK', { x: x + 12, y: y + 28, size: 8, font, color: rgb(0.85, 0.12, 0.08) })
    page.drawText(value, { x: x + 12, y: y + 12, size: 9, font, color: rgb(0.08, 0.12, 0.2), maxWidth: width - 24 })
    const annotation = doc.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [x, y, x + width, y + height], Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of(value) } })
    page.node.set(PDFName.of('Annots'), PDFArray.withContext(doc.context, [annotation]))
    onProgress((index + 1) / pages.length)
  })
  return [{ name: `${baseName(file.name)}-link-preview.pdf`, blob: toBlob(await doc.save()) }]
}

export async function highlightTextPdf(file: File, phrase: string, onProgress: Progress) {
  const search = phrase.trim().toLocaleLowerCase()
  if (!search) throw err('Enter a word or phrase to highlight.', 'Highlight کرنے کے لیے لفظ یا عبارت درج کریں۔')
  const source = await openPdfjs(file)
  const output = await loadPdf(file)
  let matches = 0
  try {
    for (let index = 1; index <= source.numPages; index++) {
      onProgress((index - 1) / source.numPages, `Searching page ${index} of ${source.numPages}`)
      const sourcePage = await source.getPage(index)
      const viewport = sourcePage.getViewport({ scale: 1 })
      const content = await sourcePage.getTextContent()
      const outputPage = output.getPage(index - 1)
      for (const item of content.items) {
        if (!('str' in item) || !item.str.toLocaleLowerCase().includes(search) || !('transform' in item) || !Array.isArray(item.transform))
          continue
        const x = item.transform[4]
        const y = item.transform[5]
        const first = viewport.convertToPdfPoint(x, y)
        const second = viewport.convertToPdfPoint(x + item.width, y - item.height)
        const left = Math.min(first[0], second[0])
        const bottom = Math.min(first[1], second[1])
        const width = Math.abs(second[0] - first[0])
        const height = Math.abs(second[1] - first[1])
        if (width <= 0 || height <= 0) continue
        outputPage.drawRectangle({ x: left, y: bottom, width, height, color: rgb(1, 0.88, 0.2), opacity: 0.38, borderWidth: 0 })
        matches++
      }
      sourcePage.cleanup()
      await tick()
    }
  } finally {
    await source.destroy()
  }
  if (!matches)
    throw err('No selectable text runs matched that phrase. Scanned pages require OCR first.', 'منتخب متن میں یہ عبارت نہیں ملی۔ Scanned صفحات کے لیے پہلے OCR کریں۔')
  onProgress(0.97, `Highlighted ${matches} text runs`)
  return [{ name: `${baseName(file.name)}-highlighted.pdf`, blob: toBlob(await output.save()) }]
}

export async function annotatePdf(file: File, note: string, pages: number[], onProgress: Progress) {
  const text = note.trim()
  if (!text) throw err('Enter a note to add.', 'شامل کرنے کے لیے نوٹ لکھیں۔')
  if (text.length > 240) throw err('Keep notes under 240 characters.', 'نوٹ 240 حروف سے کم رکھیں۔')
  if (!pages.length) throw err('Select at least one page for the note.', 'نوٹ کے لیے کم از کم ایک صفحہ منتخب کریں۔')
  const doc = await loadPdf(file)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  try {
    font.encodeText(text)
  } catch {
    throw err('Notes support basic Latin characters only.', 'نوٹس میں صرف بنیادی Latin حروف معاون ہیں۔')
  }
  for (let index = 0; index < pages.length; index++) {
    const pageIndex = pages[index]
    const page = doc.getPage(pageIndex)
    const width = Math.min(page.getWidth() - 48, 360)
    const height = 88
    if (width <= 80 || page.getHeight() < height + 48)
      throw err(`Page ${pageIndex + 1} is too small for a note.`, `صفحہ ${pageIndex + 1} نوٹ کے لیے بہت چھوٹا ہے۔`)
    const x = 24
    const y = page.getHeight() - height - 24
    page.drawRectangle({ x, y, width, height, color: rgb(1, 0.97, 0.78), borderColor: rgb(0.75, 0.59, 0.14), borderWidth: 0.8 })
    page.drawText('NOTE', { x: x + 10, y: y + height - 18, size: 8, font, color: rgb(0.42, 0.31, 0.08) })
    page.drawText(text, { x: x + 10, y: y + height - 36, size: 10, font, color: rgb(0.12, 0.12, 0.16), maxWidth: width - 20, lineHeight: 12 })
    onProgress((index + 1) / pages.length, `Adding note to page ${pageIndex + 1}`)
  }
  return [{ name: `${baseName(file.name)}-annotated.pdf`, blob: toBlob(await doc.save()) }]
}

export async function redactTextPdf(file: File, phrase: string, onProgress: Progress) {
  const search = phrase.trim().toLocaleLowerCase()
  if (!search) throw err('Enter the text to redact.', 'مٹانے کے لیے متن درج کریں۔')
  const source = await openPdfjs(file)
  const output = await PDFDocument.create()
  let matches = 0
  try {
    for (let index = 1; index <= source.numPages; index++) {
      onProgress(((index - 1) / source.numPages) * 0.9, `Checking page ${index} of ${source.numPages}`)
      const sourcePage = await source.getPage(index)
      const viewport = sourcePage.getViewport({ scale: 1 })
      const content = await sourcePage.getTextContent()
      const mask = document.createElement('canvas')
      mask.width = Math.ceil(viewport.width)
      mask.height = Math.ceil(viewport.height)
      const context = mask.getContext('2d')
      if (!context) throw err('Your browser could not create a redaction canvas.', 'براؤزر redaction canvas نہیں بنا سکا۔')
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, mask.width, mask.height)
      await sourcePage.render({ canvas: mask, canvasContext: context, viewport }).promise
      context.fillStyle = '#000000'
      for (const item of content.items) {
        if (!('str' in item) || !item.str.toLocaleLowerCase().includes(search) || !('transform' in item) || !Array.isArray(item.transform))
          continue
        const [x0, y0] = viewport.convertToViewportPoint(item.transform[4], item.transform[5])
        const [x1, y1] = viewport.convertToViewportPoint(item.transform[4] + item.width, item.transform[5] - item.height)
        const left = Math.max(0, Math.min(x0, x1) - 2)
        const top = Math.max(0, Math.min(y0, y1) - 1)
        const width = Math.min(mask.width - left, Math.abs(x1 - x0) + 4)
        const height = Math.min(mask.height - top, Math.abs(y1 - y0) + 2)
        if (width <= 0 || height <= 0) continue
        context.fillRect(left, top, width, height)
        matches++
      }
      const encoded = await canvasToBlob(mask, 'image/jpeg', 0.96)
      const image = await output.embedJpg(new Uint8Array(await encoded.arrayBuffer()))
      const outputPage = output.addPage([viewport.width, viewport.height])
      outputPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height })
      mask.width = 0
      sourcePage.cleanup()
      await tick()
    }
  } finally {
    await source.destroy()
  }
  if (!matches)
    throw err('No selectable text runs matched that phrase. Scanned pages require OCR first.', 'منتخب متن میں یہ عبارت نہیں ملی۔ Scanned صفحات کے لیے پہلے OCR کریں۔')
  onProgress(0.97, `Redacted ${matches} text runs`)
  return [{ name: `${baseName(file.name)}-redacted.pdf`, blob: toBlob(await output.save({ useObjectStreams: true })) }]
}

export async function addHeaderFooter(file: File, opts: { header: string; footer: string; size: number }, onProgress: Progress) {
  if (!opts.header.trim() && !opts.footer.trim()) throw err('Enter a header, a footer, or both.', 'Header یا footer میں سے کوئی ایک درج کریں۔')
  const doc = await loadPdf(file)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const pages = doc.getPages()
  pages.forEach((page, index) => {
    const { width, height } = page.getSize()
    if (opts.header.trim()) page.drawText(opts.header, { x: 36, y: height - 30, size: opts.size, font, color: rgb(0.25, 0.27, 0.32), maxWidth: width - 72 })
    if (opts.footer.trim()) page.drawText(opts.footer, { x: 36, y: 18, size: opts.size, font, color: rgb(0.25, 0.27, 0.32), maxWidth: width - 72 })
    onProgress((index + 1) / pages.length)
  })
  return [{ name: `${baseName(file.name)}-header-footer.pdf`, blob: toBlob(await doc.save()) }]
}

export async function cropPdf(file: File, margins: { top: number; right: number; bottom: number; left: number }, onProgress: Progress) {
  const doc = await loadPdf(file)
  const pages = doc.getPages()
  pages.forEach((page, index) => {
    const box = page.getCropBox()
    const width = box.width - margins.left - margins.right
    const height = box.height - margins.top - margins.bottom
    if (width <= 0 || height <= 0) throw err(`Crop margins are too large for page ${index + 1}.`, `صفحہ ${index + 1} کے لیے crop margins بہت زیادہ ہیں۔`)
    page.setCropBox(box.x + margins.left, box.y + margins.bottom, width, height)
    onProgress((index + 1) / pages.length)
  })
  return [{ name: `${baseName(file.name)}-cropped.pdf`, blob: toBlob(await doc.save()) }]
}

export async function extractMetadata(file: File, onProgress: Progress) {
  const doc = await loadPdf(file)
  onProgress(0.7, 'Reading document properties')
  const value = {
    title: doc.getTitle(),
    author: doc.getAuthor(),
    subject: doc.getSubject(),
    keywords: doc.getKeywords(),
    creator: doc.getCreator(),
    producer: doc.getProducer(),
    creationDate: doc.getCreationDate()?.toISOString() ?? null,
    modificationDate: doc.getModificationDate()?.toISOString() ?? null,
    pageCount: doc.getPageCount(),
    pageSizes: doc.getPages().map((page) => {
      const { width, height } = page.getSize()
      return { width, height, rotation: page.getRotation().angle }
    }),
  }
  return [{ name: `${baseName(file.name)}-metadata.json`, blob: new Blob([JSON.stringify(value, null, 2)], { type: 'application/json;charset=utf-8' }) }]
}

export async function pdfToPng(file: File, dpi: number, onProgress: Progress) {
  const pdf = await openPdfjs(file)
  const name = baseName(file.name)
  const outputs: Output[] = []
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress((i - 1) / pdf.numPages, `Page ${i} of ${pdf.numPages}`)
      const page = await pdf.getPage(i)
      const { canvas } = await renderPage(page, dpi / 72)
      outputs.push({ name: `${name}-page-${i}.png`, blob: await canvasToBlob(canvas, 'image/png') })
      canvas.width = 0
      page.cleanup()
    }
  } finally {
    await pdf.destroy()
  }
  return outputs
}

type PowerPointPage = { data: string; mimeType: 'image/jpeg' | 'image/png'; width: number; height: number }

export async function createPowerpoint(pages: PowerPointPage[], outputName: string, title: string, onProgress: Progress): Promise<Output[]> {
  if (!pages.length) throw err('This PDF contains no pages to export.', 'اس PDF میں برآمد کرنے کے لیے صفحات نہیں ہیں۔')
  const firstPage = pages[0]
  if (![firstPage.width, firstPage.height].every((size) => Number.isFinite(size) && size > 0))
    throw err('The PDF has invalid page dimensions.', 'PDF کے صفحے کے dimensions درست نہیں ہیں۔')

  const maxSlideInches = 48
  const slideScale = Math.min(1, maxSlideInches / Math.max(firstPage.width, firstPage.height))
  const slideWidth = firstPage.width * slideScale
  const slideHeight = firstPage.height * slideScale
  const { default: PptxGenJS } = await import('pptxgenjs')
  const presentation = new PptxGenJS()
  presentation.defineLayout({ name: 'PDF_PAGE', width: slideWidth, height: slideHeight })
  presentation.layout = 'PDF_PAGE'
  presentation.title = title
  presentation.author = 'PDF Pilot 5U'
  presentation.subject = 'Rasterized pages exported from a PDF'

  pages.forEach((page, index) => {
    if (![page.width, page.height].every((size) => Number.isFinite(size) && size > 0) || !page.data)
      throw err(`Page ${index + 1} could not be added to the presentation.`, `صفحہ ${index + 1} پریزنٹیشن میں شامل نہیں ہو سکا۔`)
    const fitScale = Math.min(slideWidth / page.width, slideHeight / page.height)
    const width = page.width * fitScale
    const height = page.height * fitScale
    presentation.addSlide().addImage({
      data: `${page.mimeType};base64,${page.data}`,
      x: (slideWidth - width) / 2,
      y: (slideHeight - height) / 2,
      w: width,
      h: height,
      altText: `PDF page ${index + 1} rendered as a non-editable image`,
    })
    onProgress((index + 1) / (pages.length + 1), `Adding slide ${index + 1} of ${pages.length}`)
  })

  onProgress(0.95, 'Building PowerPoint file')
  const result = await presentation.write({ outputType: 'arraybuffer', compression: true })
  if (!(result instanceof ArrayBuffer)) throw err('The PowerPoint file could not be created.', 'PowerPoint فائل نہیں بن سکی۔')
  const blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
  if (blob.size === 0) throw err('The PowerPoint file could not be created.', 'PowerPoint فائل نہیں بن سکی۔')
  return [{ name: outputName, blob }]
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(err('Could not read the rendered page image.', 'صفحے کی تصویر نہیں پڑھی جا سکی۔'))
    reader.onerror = () => reject(err('Could not read the rendered page image.', 'صفحے کی تصویر نہیں پڑھی جا سکی۔'))
    reader.readAsDataURL(blob)
  })
}

export async function pdfToPowerpoint(file: File, dpi: number, onProgress: Progress) {
  if (!Number.isFinite(dpi) || dpi < 72 || dpi > 200)
    throw err('Choose a resolution between 72 and 200 DPI.', '72 سے 200 DPI کے درمیان ریزولوشن منتخب کریں۔')
  const pdf = await openPdfjs(file)
  const pages: PowerPointPage[] = []
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress(((i - 1) / pdf.numPages) * 0.75, `Rendering page ${i} of ${pdf.numPages}`)
      const sourcePage = await pdf.getPage(i)
      const dimensions = sourcePage.getViewport({ scale: 1 })
      const { canvas } = await renderPage(sourcePage, dpi / 72)
      const image = await canvasToBlob(canvas, 'image/jpeg', 0.9)
      const dataUrl = await blobToDataUrl(image)
      pages.push({ data: dataUrl.slice(dataUrl.indexOf(',') + 1), mimeType: 'image/jpeg', width: dimensions.width / 72, height: dimensions.height / 72 })
      canvas.width = 0
      sourcePage.cleanup()
      await tick()
    }
  } finally {
    await pdf.destroy()
  }
  return createPowerpoint(pages, `${baseName(file.name)}.pptx`, baseName(file.name), (fraction, label) =>
    onProgress(0.75 + fraction * 0.25, label),
  )
}

type ExtractedPage = { page: number; text: string; width: number; height: number }

async function extractTextPages(file: File, onProgress: Progress): Promise<ExtractedPage[]> {
  const pdf = await openPdfjs(file)
  const pages: ExtractedPage[] = []
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress((i - 1) / pdf.numPages, `Page ${i} of ${pdf.numPages}`)
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 1 })
      const content = await page.getTextContent()
      const items = content.items.filter((item): item is typeof item & { str: string } => 'str' in item && typeof item.str === 'string')
      pages.push({
        page: i,
        text: items.map((item) => item.str).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
        width: viewport.width,
        height: viewport.height,
      })
      page.cleanup()
    }
  } finally {
    await pdf.destroy()
  }
  return pages
}

export async function comparePdfText(files: File[], onProgress: Progress) {
  if (files.length !== 2) throw err('Choose exactly two PDF files to compare.', 'موازنہ کے لیے بالکل دو PDF فائلیں منتخب کریں۔')
  const left = await extractTextPages(files[0], (fraction) => onProgress(fraction * 0.5, files[0].name))
  const right = await extractTextPages(files[1], (fraction) => onProgress(0.5 + fraction * 0.5, files[1].name))
  const count = Math.max(left.length, right.length)
  const changed = Array.from({ length: count }, (_, index) => ({
    page: index + 1,
    before: left[index]?.text ?? '',
    after: right[index]?.text ?? '',
  })).filter((page) => page.before !== page.after)
  const escape = (text: string) => text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>PDF text comparison</title><style>body{font:15px/1.5 system-ui,sans-serif;max-width:1000px;margin:2rem auto;padding:0 1rem;color:#1f2937}article{border:1px solid #ddd;border-radius:12px;padding:1rem;margin:1rem 0}h2{color:#b42318}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#fef3f2;padding:.75rem;border-radius:8px}</style><h1>PDF text comparison</h1><p>${changed.length} changed page(s) out of ${count}. Text is compared only; visual/layout changes are not detected.</p>${changed.map((page) => `<article><h2>Page ${page.page}</h2><strong>Before</strong><pre>${escape(page.before || '(No selectable text)')}</pre><strong>After</strong><pre>${escape(page.after || '(No selectable text)')}</pre></article>`).join('')}</html>`
  return [{ name: 'pdf-comparison.html', blob: new Blob([html], { type: 'text/html;charset=utf-8' }) }]
}

export async function pdfToMarkdown(file: File, onProgress: Progress) {
  const pages = await extractTextPages(file, onProgress)
  const markdown = pages.map((page) => `## Page ${page.page}\n\n${page.text}`).join('\n\n')
  return [{ name: `${baseName(file.name)}.md`, blob: new Blob([markdown], { type: 'text/markdown;charset=utf-8' }) }]
}

export async function pdfToHtml(file: File, onProgress: Progress) {
  const pages = await extractTextPages(file, onProgress)
  const escape = (text: string) => text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escape(baseName(file.name))}</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;color:#1f2937}.page{border-bottom:1px solid #ddd;padding:1rem 0 2rem;min-height:180px}h2{font-size:1rem;color:#b42318}</style>
</head><body>${pages.map((page) => `<section class="page"><h2>Page ${page.page}</h2><p>${escape(page.text)}</p></section>`).join('')}</body></html>`
  return [{ name: `${baseName(file.name)}.html`, blob: new Blob([html], { type: 'text/html;charset=utf-8' }) }]
}

export async function pdfToJson(file: File, onProgress: Progress) {
  const pages = await extractTextPages(file, onProgress)
  return [{ name: `${baseName(file.name)}.json`, blob: new Blob([JSON.stringify({ fileName: file.name, pages }, null, 2)], { type: 'application/json;charset=utf-8' }) }]
}

function escapeXml(text: string) {
  return text.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char]!)
}

export async function createDocxFromPages(pages: ExtractedPage[], sourceName: string) {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const paragraphs = pages.map((page) => `<w:p><w:pPr><w:keepNext/></w:pPr><w:r><w:t xml:space="preserve">Page ${page.page}: ${escapeXml(page.text)}</w:t></w:r></w:p>`).join('')
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`)
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`)
  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr/></w:body></w:document>`)
  return [{ name: `${baseName(sourceName)}.docx`, blob: await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }) }]
}

export async function pdfToWord(file: File, onProgress: Progress) {
  return createDocxFromPages(await extractTextPages(file, onProgress), file.name)
}

export async function pdfToExcel(file: File, onProgress: Progress) {
  const pages = await extractTextPages(file, onProgress)
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const rows = pages.map((page, index) => `<row r="${index + 1}"><c r="A${index + 1}" t="inlineStr"><is><t>${page.page}</t></is></c><c r="B${index + 1}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(page.text.slice(0, 32000))}</t></is></c></row>`).join('')
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`)
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`)
  zip.file('xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="PDF pages" sheetId="1" r:id="rId1"/></sheets></workbook>`)
  zip.file('xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`)
  zip.file('xl/worksheets/sheet1.xml', `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows}</sheetData></worksheet>`)
  return [{ name: `${baseName(file.name)}.xlsx`, blob: await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) }]
}
export async function pdfToCsv(file: File, onProgress: Progress) {
  const pdf = await openPdfjs(file)
  const rows: string[][] = []
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      onProgress((pageNumber - 1) / pdf.numPages, `Page ${pageNumber} of ${pdf.numPages}`)
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      const positioned = content.items
        .filter((item): item is typeof item & { str: string; transform: number[] } => 'str' in item && 'transform' in item && typeof item.str === 'string' && Array.isArray(item.transform))
        .map((item) => ({ text: item.str.trim(), x: item.transform[4], y: item.transform[5] }))
        .filter((item) => item.text)
        .sort((a, b) => b.y - a.y || a.x - b.x)
      const pageRows: { y: number; cells: { x: number; text: string }[] }[] = []
      for (const item of positioned) {
        let row = pageRows.find((candidate) => Math.abs(candidate.y - item.y) <= 3)
        if (!row) {
          row = { y: item.y, cells: [] }
          pageRows.push(row)
        }
        row.cells.push({ x: item.x, text: item.text })
      }
      for (const row of pageRows) {
        row.cells.sort((a, b) => a.x - b.x)
        const cells: string[] = []
        let lastX = Number.NEGATIVE_INFINITY
        for (const cell of row.cells) {
          if (cells.length === 0 || cell.x - lastX > 24) cells.push(cell.text)
          else cells[cells.length - 1] = `${cells[cells.length - 1]} ${cell.text}`
          lastX = cell.x
        }
        if (cells.length) rows.push([String(pageNumber), ...cells])
      }
      page.cleanup()
    }
  } finally {
    await pdf.destroy()
  }
  if (!rows.length) throw err('No selectable text was found. Scanned pages require OCR.', 'منتخب متن نہیں ملا۔ Scanned صفحات کے لیے OCR درکار ہے۔')
  const columns = Math.max(...rows.map((row) => row.length - 1))
  const table = [['page', ...Array.from({ length: columns }, (_, index) => `column_${index + 1}`)], ...rows]
  const csv = table.map((row) => row.map(quote).join(',')).join('\r\n')
  return [{ name: `${baseName(file.name)}.csv`, blob: new Blob([csv], { type: 'text/csv;charset=utf-8' }) }]
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
