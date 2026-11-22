import { Link } from '@tanstack/react-router'

export type Post = { slug: string; title: string; summary: string; date: string; body: React.ReactNode }

export const POSTS: Post[] = [
  {
    slug: 'why-browser-based-pdf-tools',
    title: 'Why we process your PDFs in the browser',
    summary: 'What “never uploaded” actually means, and which jobs a browser can and can’t do.',
    date: 'November 2026',
    body: (
      <>
        <p>
          When you open a file on PDFTools, your browser reads it into memory in that tab. The tool you picked then edits
          or renders the file with JavaScript libraries that were downloaded with the page. The result is created as a
          new file in memory and handed to your browser’s download manager.
        </p>
        <p>At no point is the file sent over the network. You can check this yourself: open a tool, disconnect from the internet, and process a file. It still works.</p>
        <h2>What browsers handle well</h2>
        <ul>
          <li>Rearranging pages: merge, split, delete, extract, reorder and rotate.</li>
          <li>Adding things to pages: numbers, watermarks and signature images.</li>
          <li>Rendering pages to images, which powers PDF to JPG and Compress PDF.</li>
        </ul>
        <h2>What they don’t, yet</h2>
        <p>
          Faithfully converting Word, Excel and PowerPoint files needs a full office suite, and reading text from scans
          needs OCR models. Those are large and slow in a browser, so we list them as coming soon instead of shipping
          something that half works.
        </p>
      </>
    ),
  },
  {
    slug: 'how-to-merge-pdfs',
    title: 'How to merge PDFs without uploading them',
    summary: 'Combine several PDFs into one, in the order you want, in under a minute.',
    date: 'November 2026',
    body: (
      <>
        <ol className="ms-5 list-decimal space-y-2">
          <li>
            Open <Link to="/tools/$slug" params={{ slug: 'merge-pdf' }}>Merge PDFs</Link>.
          </li>
          <li>Drop in two or more PDFs, or tap “Choose files”.</li>
          <li>Use the up and down arrows to put them in order. The first file’s pages come first.</li>
          <li>Press Process. The progress bar moves as each file is copied in.</li>
          <li>Download merged.pdf.</li>
        </ol>
        <h2>Tips</h2>
        <ul>
          <li>Need only some pages from a file? Run it through Extract Pages first.</li>
          <li>Password-protected files can’t be merged until the protection is removed.</li>
        </ul>
      </>
    ),
  },
  {
    slug: 'compress-pdf-honestly',
    title: 'What Compress PDF does to your file',
    summary: 'Our compressor redraws pages as images. Here’s when that helps, and when to keep the original.',
    date: 'November 2026',
    body: (
      <>
        <p>
          PDFTools compresses a PDF by rendering each page to a JPEG at the resolution and quality you choose, then
          building a new PDF from those images. This is the same approach as “print to image”.
        </p>
        <h2>When it helps</h2>
        <ul>
          <li>Scanned documents and photo-heavy PDFs, which often shrink a lot.</li>
          <li>Files you only need to read or print, not edit.</li>
        </ul>
        <h2>The trade-off</h2>
        <p>
          Text becomes part of the image. It can’t be selected, searched or read by screen readers, and links stop
          working. Text-only PDFs may even get bigger. The tool shows the size before and after, so you can decide.
        </p>
      </>
    ),
  },
]
