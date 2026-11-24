import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import aiHandler from '../api/ai.ts'
import { LISTED_TOOLS, TOOL_REDIRECTS, TOOLS } from '../src/lib/tools.ts'
import { getPostWordCount, POSTS } from '../src/lib/blog.ts'
import {
  createDocxFromPages,
  deletePages,
  createPowerpoint,
  annotatePdf,
  duplicatePages,
  extractPages,
  mergePdfs,
  parseRanges,
  protectPdf,
  removeMetadata,
  redactTextPdf,
  splitPdf,
  textToPdf,
  unlockPdf,
  validateFile,
} from '../src/lib/pdf.ts'

function apiResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  }
}

async function fixture(name = 'input.pdf', pageCount = 2) {
  const document = await PDFDocument.create()
  for (let i = 0; i < pageCount; i++) document.addPage([300 + i * 10, 400])
  document.setTitle('Fixture')
  document.setAuthor('PDF Pilot 5U test')
  return new File([await document.save()], name, { type: 'application/pdf' })
}

test('public tool catalog hides unavailable tools and redirects duplicate aliases', async () => {
  const slugs = TOOLS.map((tool) => tool.slug)
  assert.equal(new Set(slugs).size, slugs.length)
  assert.ok(LISTED_TOOLS.every((tool) => tool.status === 'working'))
  assert.ok(['chat-with-pdf', 'ai-pdf-summarizer', 'ai-document-qa', 'ai-document-translator', 'pdf-translator', 'ai-key-points', 'ai-report-generator'].every((slug) => LISTED_TOOLS.some((tool) => tool.slug === slug)))
  assert.ok(LISTED_TOOLS.every((tool) => !TOOL_REDIRECTS[tool.slug]))
  assert.ok(LISTED_TOOLS.every((tool) => tool.desc.en.length >= 65 && tool.desc.en.length <= 160))
  const compressTool = LISTED_TOOLS.find((tool) => tool.slug === 'compress-pdf')
  const optimizeTool = LISTED_TOOLS.find((tool) => tool.slug === 'optimize-pdf')
  assert.ok(compressTool)
  assert.ok(optimizeTool)
  assert.equal(compressTool.note, undefined)
  assert.match(compressTool.desc.en, /lossy conversion/i)
  assert.match(optimizeTool.desc.en, /without rasterizing pages/i)
  for (const [alias, destination] of Object.entries(TOOL_REDIRECTS)) {
    assert.ok(TOOLS.some((tool) => tool.slug === alias))
    assert.ok(LISTED_TOOLS.some((tool) => tool.slug === destination))
    assert.ok(!LISTED_TOOLS.some((tool) => tool.slug === alias))
  }

  const workspace = await readFile(new URL('../src/components/tool/ToolWorkspace.tsx', import.meta.url), 'utf8')
  const dispatchSlugs = new Set([...workspace.matchAll(/^  '([^']+)':/gm)].map((match) => match[1]))
  assert.deepEqual(LISTED_TOOLS.map((tool) => tool.slug).filter((slug) => !dispatchSlugs.has(slug)), [])
})

test('original blog guides exceed 1,500 words and link only to listed tools', () => {
  assert.ok(POSTS.length >= 1)
  for (const post of POSTS) {
    assert.ok(getPostWordCount(post) > 1500, `${post.slug} should exceed 1,500 words`)
    assert.ok(post.preview.trim().length > 0, `${post.slug} should have a useful preview`)
    assert.ok(post.sections.length > 0, `${post.slug} should have article sections`)
    for (const tool of post.relatedTools) {
      assert.ok(LISTED_TOOLS.some((listed) => listed.slug === tool.slug), `${post.slug} links to unavailable tool ${tool.slug}`)
    }
  }
})

test('AI endpoint rejects unsupported methods, foreign origins, and incomplete requests', async () => {
  const methodResponse = apiResponse()
  await aiHandler({ method: 'GET', headers: {} }, methodResponse)
  assert.equal(methodResponse.statusCode, 405)

  const originResponse = apiResponse()
  await aiHandler({ method: 'POST', headers: { origin: 'https://untrusted.example' }, body: {} }, originResponse)
  assert.equal(originResponse.statusCode, 403)

  const inputResponse = apiResponse()
  await aiHandler({ method: 'POST', headers: {}, body: { action: 'question', text: 'document text' } }, inputResponse)
  assert.equal(inputResponse.statusCode, 400)
  assert.match(inputResponse.body.error, /settings are invalid/i)
})

test('AI endpoint accepts a verified anonymous session and calls the available Gemini Flash model', async () => {
  const savedEnv = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  }
  const originalFetch = globalThis.fetch
  let calledModel = ''
  process.env.GEMINI_API_KEY = 'test-gemini-key'
  process.env.SUPABASE_URL = 'https://supabase.example'
  process.env.SUPABASE_ANON_KEY = 'test-anon-key'
  globalThis.fetch = async (input) => {
    const url = new URL(String(input))
    if (url.pathname === '/auth/v1/user') {
      return new Response(JSON.stringify({
        id: 'test-user',
        aud: 'authenticated',
        role: 'authenticated',
        is_anonymous: true,
        app_metadata: { provider: 'anonymous', providers: [] },
        user_metadata: {},
        created_at: '2026-01-01T00:00:00.000Z',
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    calledModel = url.pathname
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'A short summary.' }] } }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const response = apiResponse()
    await aiHandler({
      method: 'POST',
      headers: {
        origin: 'https://pdfpilot5u.vercel.app',
        authorization: 'Bearer test-access-token',
      },
      body: { action: 'summary', text: 'A document for summarization.' },
    }, response)
    assert.equal(response.statusCode, 200)
    assert.equal(response.body.text, 'A short summary.')
    assert.equal(calledModel, '/v1beta/models/gemini-3.5-flash-lite:generateContent')
  } finally {
    globalThis.fetch = originalFetch
    for (const [name, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[name]
      else process.env[name] = value
    }
  }
})

async function outputPageCount(blob) {
  const doc = await PDFDocument.load(new Uint8Array(await blob.arrayBuffer()))
  return doc.getPageCount()
}

test('validates PDF signatures and rejects renamed non-PDF files', async () => {
  const valid = await fixture()
  assert.equal(await validateFile(valid, 'pdf'), 'pdf')
  await assert.rejects(() => validateFile(new File(['not a PDF'], 'fake.pdf', { type: 'application/pdf' }), 'pdf'), /not a valid PDF/i)
  await assert.rejects(() => validateFile(new File([], 'empty.pdf', { type: 'application/pdf' }), 'pdf'), /is empty/i)
})

test('parses page ranges and rejects out-of-range values', () => {
  assert.deepEqual(parseRanges('1-2, 4', 4), [[0, 1], [3]])
  assert.deepEqual(parseRanges('3-', 4), [[2, 3]])
  assert.throws(() => parseRanges('1-5', 4), /outside pages/i)
})

test('merges files and splits the result into valid PDFs', async () => {
  const first = await fixture('one.pdf', 2)
  const second = await fixture('two.pdf', 1)
  const merged = await mergePdfs([first, second], () => {})
  assert.equal(await outputPageCount(merged[0].blob), 3)
  const split = await splitPdf(new File([merged[0].blob], 'merged.pdf', { type: 'application/pdf' }), { mode: 'every', ranges: '' }, () => {})
  assert.equal(split.length, 3)
  assert.deepEqual(await Promise.all(split.map((item) => outputPageCount(item.blob))), [1, 1, 1])
})

test('extracts, removes and duplicates selected pages', async () => {
  const source = await fixture()
  const extracted = await extractPages(source, [1], false, () => {})
  assert.equal(await outputPageCount(extracted[0].blob), 1)
  const removed = await deletePages(source, [0], () => {})
  assert.equal(await outputPageCount(removed[0].blob), 1)
  const duplicated = await duplicatePages(source, [0], () => {})
  assert.equal(await outputPageCount(duplicated[0].blob), 3)
})

test('removes document metadata from the output PDF', async () => {
  const source = await fixture()
  const output = await removeMetadata(source, () => {})
  const doc = await PDFDocument.load(new Uint8Array(await output[0].blob.arrayBuffer()), { updateMetadata: false })
  assert.equal(doc.getTitle(), undefined)
  assert.equal(doc.getAuthor(), undefined)
  assert.equal(doc.getSubject(), undefined)
  assert.equal(doc.getKeywords(), undefined)
  assert.equal(doc.getCreator(), undefined)
  assert.equal(doc.getProducer(), undefined)
  assert.equal(doc.getCreationDate(), undefined)
  assert.equal(doc.getModificationDate(), undefined)
})

test('protects a PDF with AES-256 and unlocks it only with the correct password', async () => {
  const source = await fixture('secure.pdf', 2)
  const [protectedOutput] = await protectPdf(source, 'correct horse battery staple', () => {})
  const encryptedBytes = new Uint8Array(await protectedOutput.blob.arrayBuffer())
  const { isEncrypted, decryptPDF } = await import('@pdfsmaller/pdf-decrypt')
  assert.equal((await isEncrypted(encryptedBytes)).algorithm, 'AES-256')
  await assert.rejects(() => decryptPDF(encryptedBytes, 'wrong password'), /incorrect password/i)
  await assert.rejects(() => unlockPdf(new File([encryptedBytes], 'secure.pdf', { type: 'application/pdf' }), 'wrong password', () => {}), /incorrect/i)
  const [unlocked] = await unlockPdf(new File([encryptedBytes], 'secure.pdf', { type: 'application/pdf' }), 'correct horse battery staple', () => {})
  assert.equal(await outputPageCount(unlocked.blob), 2)
  await assert.rejects(() => protectPdf(source, 'short', () => {}), /at least 8 characters/i)
})

test('converts plain text into a paginated PDF with valid pages', async () => {
  const source = new File(['A short document\\nwith two lines.'], 'notes.txt', { type: 'text/plain' })
  assert.equal(await validateFile(source, 'text'), 'text')
  const output = await textToPdf(source, () => {})
  assert.equal(await outputPageCount(output[0].blob), 1)
  await assert.rejects(() => validateFile(new File(['x'], 'notes.pdf', { type: 'application/pdf' }), 'text'), /plain text/i)
})

test('exports selectable PDF text as a downloadable DOCX package', async () => {
  const [output] = await createDocxFromPages([{ page: 1, text: 'Example <document> text.', width: 300, height: 400 }], 'word-export.pdf')
  assert.equal(output.name, 'word-export.docx')
  const zip = await JSZip.loadAsync(await output.blob.arrayBuffer())
  const document = await zip.file('word/document.xml').async('string')
  assert.match(document, /wordprocessingml\/2006\/main/)
  assert.match(document, /Page 1/)
  assert.match(document, /Example &lt;document&gt; text\./)
})

test('validates Office conversion inputs as ZIP documents with the expected part', async () => {
  const zip = new JSZip()
  zip.file('word/document.xml', '<document/>')
  const bytes = await zip.generateAsync({ type: 'uint8array' })
  const valid = new File([bytes], 'document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  assert.equal(await validateFile(valid, 'docx'), 'docx')

  const fake = new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04])], 'fake.docx')
  await assert.rejects(() => validateFile(fake, 'docx'), /not a readable DOCX/i)
  await assert.rejects(() => validateFile(new File([bytes], 'document.zip'), 'docx'), /not a valid DOCX archive/i)
})

test('creates a PowerPoint package with one slide and embedded page image', async () => {
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg=='
  const [output] = await createPowerpoint([{ data: png, mimeType: 'image/png', width: 8.5, height: 11 }], 'pages.pptx', 'Test PDF', () => {})
  const zip = await JSZip.loadAsync(await output.blob.arrayBuffer())
  assert.ok(zip.file('ppt/presentation.xml'))
  assert.ok(zip.file('ppt/slides/slide1.xml'))
  const mediaFiles = Object.keys(zip.files).filter((path) => path.startsWith('ppt/media/'))
  assert.ok(mediaFiles.length >= 1)
  const slide = await zip.file('ppt/slides/slide1.xml').async('string')
  assert.match(slide, /PDF page 1 rendered as a non-editable image/)
  const rels = await zip.file('ppt/slides/_rels/slide1.xml.rels').async('string')
  assert.match(rels, /Target="\.\.\/media\/image/)
})

test('validates HEIC files by extension, MIME and ISO-BMFF brands', async () => {
  const bytes = new Uint8Array(32)
  bytes.set([0, 0, 0, 32], 0)
  bytes.set(new TextEncoder().encode('ftypheic'), 4)
  bytes.set(new TextEncoder().encode('mif1'), 16)
  const valid = new File([bytes], 'photo.heic', { type: 'image/heic' })
  assert.equal(await validateFile(valid, 'heic'), 'heic')
  await assert.rejects(() => validateFile(new File([bytes], 'photo.heic', { type: 'image/jpeg' }), 'heic'), /not a valid HEIC\/HEIF/i)
  await assert.rejects(() => validateFile(new File([new Uint8Array([0x50, 0x4b])], 'photo.heic'), 'heic'), /not a valid HEIC\/HEIF/i)
})

test('adds visible notes to selected pages and rejects unsupported note text', async () => {
  const source = await fixture('annotate.pdf', 2)
  const [output] = await annotatePdf(source, 'Review this page', [1], () => {})
  assert.equal(await outputPageCount(output.blob), 2)
  await assert.rejects(() => annotatePdf(source, 'نسخة', [0], () => {}), /basic Latin/i)
  await assert.rejects(() => annotatePdf(source, 'note', [], () => {}), /Select at least one page/i)
})

test('requires a non-empty phrase for text redaction before any rendering', async () => {
  const source = await fixture('redact.pdf', 1)
  await assert.rejects(() => redactTextPdf(source, '  ', () => {}), /Enter the text to redact/i)
})
