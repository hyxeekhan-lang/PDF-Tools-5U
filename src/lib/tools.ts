import {
  ArrowDownUp,
  FileArchive,
  FileImage,
  FileLock2,
  FileMinus,
  FileOutput,
  FileSpreadsheet,
  FileText,
  Hash,
  Image,
  Layers,
  LockOpen,
  PenLine,
  Presentation,
  RotateCw,
  ScanText,
  GitCompare,
  Edit3,
  SlidersHorizontal,
  ListChecks,
  Scissors,
  Stamp,
  type LucideIcon,
} from 'lucide-react'

export type CategoryId = 'convert-to' | 'convert-from' | 'organize' | 'optimize' | 'edit' | 'secure' | 'advanced' | 'ai'

export const CATEGORIES: CategoryId[] = ['organize', 'optimize', 'convert-to', 'convert-from', 'edit', 'secure', 'advanced', 'ai']

export type Tool = {
  slug: string
  category: CategoryId
  status: 'working' | 'soon'
  icon: LucideIcon
  accepts: 'pdf' | 'image' | 'heic' | 'text' | 'docx' | 'xlsx' | 'pptx' | 'html'
  multiple?: boolean
  name: { en: string; ur: string }
  desc: { en: string; ur: string }
  keywords: string[]
  note?: { en: string; ur: string }
}

export const TOOLS: Tool[] = [
  {
    slug: 'merge-pdf',
    category: 'organize',
    status: 'working',
    icon: Layers,
    accepts: 'pdf',
    multiple: true,
    name: { en: 'Merge PDFs', ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ ÛŒÚ©Ø¬Ø§ Ú©Ø±ÛŒÚº' },
    desc: {
      en: 'Combine two or more PDFs in your chosen order. Processing runs in your browser; review the new page sequence before sharing.',
      ur: 'Ú©Ø¦ÛŒ Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ ÙØ§Ø¦Ù„ÙˆÚº Ú©Ùˆ Ø§Ù¾Ù†ÛŒ Ù…Ø±Ø¶ÛŒ Ú©ÛŒ ØªØ±ØªÛŒØ¨ Ù…ÛŒÚº Ø§ÛŒÚ© ÙØ§Ø¦Ù„ Ù…ÛŒÚº Ø¬ÙˆÚ‘ÛŒÚºÛ”',
    },
    keywords: ['combine', 'join', 'append', 'merge', 'jorna', 'ÛŒÚ©Ø¬Ø§'],
  },
  {
    slug: 'split-pdf',
    category: 'organize',
    status: 'working',
    icon: Scissors,
    accepts: 'pdf',
    name: { en: 'Split PDF', ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ ØªÙ‚Ø³ÛŒÙ… Ú©Ø±ÛŒÚº' },
    desc: {
      en: 'Split a PDF by page ranges or into single pages, then download files separately or in a ZIP. Encrypted PDFs need the correct password first.',
      ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ú©Ùˆ ØµÙØ­Ø§Øª Ú©ÛŒ Ø­Ø¯ÙˆØ¯ ÛŒØ§ Ø§Ù„Ú¯ Ø§Ù„Ú¯ ØµÙØ­Ø§Øª Ù…ÛŒÚº ØªÙ‚Ø³ÛŒÙ… Ú©Ø±ÛŒÚºÛ” ZIP ÛŒØ§ Ø§Ù„Ú¯ ÚˆØ§Ø¤Ù† Ù„ÙˆÚˆ Ú©Ø±ÛŒÚºÛ”',
    },
    keywords: ['split', 'separate', 'divide', 'cut', 'ranges', 'ØªÙ‚Ø³ÛŒÙ…'],
  },
  {
    slug: 'rotate-pdf',
    category: 'organize',
    status: 'working',
    icon: RotateCw,
    accepts: 'pdf',
    name: { en: 'Rotate PDF', ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ú¯Ú¾Ù…Ø§Ø¦ÛŒÚº' },
    desc: {
      en: 'Rotate every page or selected pages by 90, 180, or 270 degrees. Preview the page orientation before downloading the updated PDF.',
      ur: 'ØªÙ…Ø§Ù… ØµÙØ­Ø§Øª ÛŒØ§ Ù…Ù†ØªØ®Ø¨ ØµÙØ­Ø§Øª Ú©Ùˆ 90Â°ØŒ 180Â° ÛŒØ§ 270Â° Ú¯Ú¾Ù…Ø§Ø¦ÛŒÚºÛ”',
    },
    keywords: ['rotate', 'turn', 'orientation', 'landscape', 'portrait', 'Ú¯Ú¾Ù…Ø§Ø¦ÛŒÚº'],
  },
  {
    slug: 'delete-pages',
    category: 'organize',
    status: 'working',
    icon: FileMinus,
    accepts: 'pdf',
    name: { en: 'Delete Pages', ur: 'ØµÙØ­Ø§Øª Ø­Ø°Ù Ú©Ø±ÛŒÚº' },
    desc: {
      en: 'Select pages to remove and export the remaining pages as a new PDF. Review the page selection carefully and keep an unchanged copy of the source.',
      ur: 'ØºÛŒØ± Ø¶Ø±ÙˆØ±ÛŒ ØµÙØ­Ø§Øª ÛÙ¹Ø§Ø¦ÛŒÚº Ø§ÙˆØ± Ø¨Ø§Ù‚ÛŒ Ø±Ú©Ú¾ÛŒÚºÛ”',
    },
    keywords: ['delete', 'remove', 'pages', 'drop', 'Ø­Ø°Ù'],
  },
  {
    slug: 'extract-pages',
    category: 'organize',
    status: 'working',
    icon: FileOutput,
    accepts: 'pdf',
    name: { en: 'Extract Pages', ur: 'ØµÙØ­Ø§Øª Ù†Ú©Ø§Ù„ÛŒÚº' },
    desc: {
      en: 'Choose specific pages from a PDF and save them as a separate document. Enter valid page numbers for the source and verify the exported page count.',
      ur: 'ØµÙØ­Ø§Øª Ù…Ù†ØªØ®Ø¨ Ú©Ø±ÛŒÚº Ø§ÙˆØ± Ø§Ù†ÛÛŒÚº Ù†Ø¦ÛŒ Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ú©Û’ Ø·ÙˆØ± Ù¾Ø± Ù…Ø­ÙÙˆØ¸ Ú©Ø±ÛŒÚºÛ”',
    },
    keywords: ['extract', 'select', 'pages', 'pull', 'Ù†Ú©Ø§Ù„ÛŒÚº'],
  },
  {
    slug: 'reorder-pages',
    category: 'organize',
    status: 'working',
    icon: ArrowDownUp,
    accepts: 'pdf',
    name: { en: 'Reorder Pages', ur: 'ØµÙØ­Ø§Øª Ú©ÛŒ ØªØ±ØªÛŒØ¨ Ø¨Ø¯Ù„ÛŒÚº' },
    desc: {
      en: 'Review page thumbnails and move pages into a new order. The tool changes page sequence, not page content; inspect the exported document before sharing it.',
      ur: 'ÛØ± ØµÙØ­Û ØªØµÙˆÛŒØ± Ú©ÛŒ Ø´Ú©Ù„ Ù…ÛŒÚº Ø¯ÛŒÚ©Ú¾ÛŒÚº Ø§ÙˆØ± Ø§ÙˆÙ¾Ø± ÛŒØ§ Ù†ÛŒÚ†Û’ Ù…Ù†ØªÙ‚Ù„ Ú©Ø±ÛŒÚºÛ”',
    },
    keywords: ['reorder', 'sort', 'arrange', 'organize', 'move', 'ØªØ±ØªÛŒØ¨'],
  },
  {
    slug: 'compress-pdf',
    category: 'edit',
    status: 'working',
    icon: FileArchive,
    accepts: 'pdf',
    name: { en: 'Compress PDF', ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ú©Ù…Ù¾Ø±ÛŒØ³ Ú©Ø±ÛŒÚº' },
    desc: {
      en: 'Reduce PDF size by rendering pages as JPEG images. This lossy conversion can remove selectable text, links, forms, and accessibility structure.',
      ur: 'ØµÙØ­Ø§Øª Ú©Ùˆ Ø¢Ù¾ Ú©ÛŒ Ù…Ù†ØªØ®Ø¨ Ú©ÙˆØ§Ù„Ù¹ÛŒ Ù¾Ø± JPEG ØªØµØ§ÙˆÛŒØ± Ø¨Ù†Ø§ Ú©Ø± Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ú©Ø§ Ø³Ø§Ø¦Ø² Ú©Ù… Ú©Ø±ÛŒÚºÛ”',
    },
    keywords: ['compress', 'reduce', 'shrink', 'smaller', 'size', 'optimize', 'Ú©Ù…Ù¾Ø±ÛŒØ³'],
  },
  {
    slug: 'sign-pdf',
    category: 'edit',
    status: 'working',
    icon: PenLine,
    accepts: 'pdf',
    name: { en: 'Sign PDF', ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ù¾Ø± Ø¯Ø³ØªØ®Ø·' },
    desc: {
      en: 'Draw or type a visible signature image and place it on a PDF page. It is not a certificate-based digital signature or identity check.',
      ur: 'Ø§Ù¾Ù†Û’ Ø¯Ø³ØªØ®Ø· Ø¨Ù†Ø§Ø¦ÛŒÚº ÛŒØ§ Ù¹Ø§Ø¦Ù¾ Ú©Ø±ÛŒÚº Ø§ÙˆØ± Ú©Ø³ÛŒ Ø¨Ú¾ÛŒ ØµÙØ­Û’ Ù¾Ø± Ù„Ú¯Ø§Ø¦ÛŒÚºÛ”',
    },
    note: {
      en: 'This adds a visible signature image. It is not a certificate-based digital signature.',
      ur: 'ÛŒÛ Ø¯Ø³ØªØ®Ø· Ú©ÛŒ ØªØµÙˆÛŒØ± Ø´Ø§Ù…Ù„ Ú©Ø±ØªØ§ ÛÛ’ØŒ Ø³Ø±Ù¹ÛŒÙÚ©ÛŒÙ¹ ÙˆØ§Ù„Ø§ ÚˆÛŒØ¬ÛŒÙ¹Ù„ Ø¯Ø³ØªØ®Ø· Ù†ÛÛŒÚºÛ”',
    },
    keywords: ['sign', 'signature', 'esign', 'autograph', 'Ø¯Ø³ØªØ®Ø·'],
  },
  {
    slug: 'add-page-numbers',
    category: 'edit',
    status: 'working',
    icon: Hash,
    accepts: 'pdf',
    name: { en: 'Add Page Numbers', ur: 'ØµÙØ­Û Ù†Ù…Ø¨Ø± Ù„Ú¯Ø§Ø¦ÛŒÚº' },
    desc: {
      en: 'Add page numbers to a PDF and choose their position, appearance, and starting value. Review the placement so numbers do not cover existing page content.',
      ur: 'ØµÙØ­Ø§Øª Ù¾Ø± Ù†Ù…Ø¨Ø± Ù„Ú¯Ø§Ø¦ÛŒÚºØŒ Ø¬Ú¯ÛØŒ Ø§Ù†Ø¯Ø§Ø² Ø§ÙˆØ± Ø§Ø¨ØªØ¯Ø§Ø¦ÛŒ Ù†Ù…Ø¨Ø± Ù…Ù†ØªØ®Ø¨ Ú©Ø±ÛŒÚºÛ”',
    },
    keywords: ['page numbers', 'numbering', 'paginate', 'footer', 'Ù†Ù…Ø¨Ø±'],
  },
  {
    slug: 'add-watermark',
    category: 'edit',
    status: 'working',
    icon: Stamp,
    accepts: 'pdf',
    name: { en: 'Add Watermark', ur: 'ÙˆØ§Ù¹Ø± Ù…Ø§Ø±Ú© Ù„Ú¯Ø§Ø¦ÛŒÚº' },
    desc: {
      en: 'Place a text watermark across PDF pages to label a draft or copy. Check its position, contrast, and readability on pages with different layouts.',
      ur: 'ÛØ± ØµÙØ­Û’ Ù¾Ø± â€œCONFIDENTIALâ€ Ø¬ÛŒØ³Ø§ Ù…ØªÙ† Ù„Ú¯Ø§Ø¦ÛŒÚºÛ”',
    },
    keywords: ['watermark', 'stamp', 'confidential', 'draft', 'ÙˆØ§Ù¹Ø± Ù…Ø§Ø±Ú©'],
  },
  {
    slug: 'jpg-to-pdf',
    category: 'convert-to',
    status: 'working',
    icon: Image,
    accepts: 'image',
    multiple: true,
    name: { en: 'JPG to PDF', ur: 'JPG Ø³Û’ Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ' },
    desc: {
      en: 'Combine JPG or PNG images into a PDF with one image on each page. Check image order and page orientation; large images can increase the output size.',
      ur: 'JPG ÛŒØ§ PNG ØªØµØ§ÙˆÛŒØ± Ú©Ùˆ Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ù…ÛŒÚº Ø¨Ø¯Ù„ÛŒÚºØŒ ÛØ± ØµÙØ­Û’ Ù¾Ø± Ø§ÛŒÚ© ØªØµÙˆÛŒØ±Û”',
    },
    keywords: ['jpg', 'jpeg', 'png', 'image', 'photo', 'picture', 'convert', 'ØªØµÙˆÛŒØ±'],
  },
  {
    slug: 'word-to-pdf',
    category: 'convert-to',
    status: 'working',
    icon: FileText,
    accepts: 'docx',
    name: { en: 'Word to PDF', ur: 'ÙˆØ±Úˆ Ø³Û’ Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ' },
    desc: { en: 'Extract DOCX text into a basic paginated PDF. Original layout, images, and formatting are not preserved; legacy DOC files are unsupported.', ur: 'Convert DOCX text to PDF.' },
    keywords: ['word', 'docx', 'doc', 'convert', 'ÙˆØ±Úˆ'],
  },
  {
    slug: 'excel-to-pdf',
    category: 'convert-to',
    status: 'working',
    icon: FileSpreadsheet,
    accepts: 'xlsx',
    name: { en: 'Excel to PDF', ur: 'Ø§ÛŒÚ©Ø³Ù„ Ø³Û’ Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ' },
    desc: { en: 'Place XLSX cell text into a basic paginated PDF. Formulas, charts, print layout, and legacy XLS files are not retained or supported.', ur: 'Convert spreadsheet text to PDF.' },
    keywords: ['excel', 'xlsx', 'spreadsheet', 'convert', 'Ø§ÛŒÚ©Ø³Ù„'],
  },
  {
    slug: 'powerpoint-to-pdf',
    category: 'convert-to',
    status: 'working',
    icon: Presentation,
    accepts: 'pptx',
    name: { en: 'PowerPoint to PDF', ur: 'Ù¾Ø§ÙˆØ±Ù¾ÙˆØ§Ø¦Ù†Ù¹ Ø³Û’ Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ' },
    desc: { en: 'Extract readable text from PPTX slides and place it into a basic PDF. Original slide layout, themes, animations, and embedded media are not preserved.', ur: 'Convert PowerPoint slide text to PDF.' },
    keywords: ['powerpoint', 'pptx', 'slides', 'presentation', 'Ù¾Ø§ÙˆØ±Ù¾ÙˆØ§Ø¦Ù†Ù¹'],
  },
  {
    slug: 'pdf-to-jpg',
    category: 'convert-from',
    status: 'working',
    icon: FileImage,
    accepts: 'pdf',
    name: { en: 'PDF to JPG', ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ø³Û’ JPG' },
    desc: {
      en: 'Render PDF pages as JPG images; multi-page results download in a ZIP. Images are not searchable or editable PDF text.',
      ur: 'ÛØ± ØµÙØ­Û JPG ØªØµÙˆÛŒØ± Ú©Û’ Ø·ÙˆØ± Ù¾Ø± Ù…Ø­ÙÙˆØ¸ Ú©Ø±ÛŒÚºÛ” Ú©Ø¦ÛŒ ØµÙØ­Ø§Øª ZIP Ù…ÛŒÚº Ù…Ù„ÛŒÚº Ú¯Û’Û”',
    },
    keywords: ['jpg', 'jpeg', 'image', 'convert', 'export', 'picture', 'ØªØµÙˆÛŒØ±'],
  },
  {
    slug: 'pdf-to-word',
    category: 'convert-from',
    status: 'working',
    icon: FileText,
    accepts: 'pdf',
    name: { en: 'PDF to Word', ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ø³Û’ ÙˆØ±Úˆ' },
    desc: { en: 'Export selectable PDF text as an editable DOCX. Layout and tables may change; scanned pages need OCR first.', ur: 'PDF text کو DOCX میں برآمد کریں۔' },
    keywords: ['word', 'docx', 'convert', 'editable', 'ÙˆØ±Úˆ'],
  },
  {
    slug: 'pdf-to-excel',
    category: 'convert-from',
    status: 'working',
    icon: FileSpreadsheet,
    accepts: 'pdf',
    name: { en: 'PDF to Excel', ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ø³Û’ Ø§ÛŒÚ©Ø³Ù„' },
    desc: { en: 'Export selectable PDF text into an XLSX workbook, separated by page. Table columns and formulas are not reconstructed.', ur: 'PDF متن کو XLSX میں برآمد کریں۔' },
    keywords: ['excel', 'xlsx', 'tables', 'convert', 'Ø§ÛŒÚ©Ø³Ù„'],
  },
  {
    slug: 'pdf-to-powerpoint',
    category: 'convert-from',
    status: 'working',
    icon: Presentation,
    accepts: 'pdf',
    name: { en: 'PDF to PowerPoint', ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ø³Û’ Ù¾Ø§ÙˆØ±Ù¾ÙˆØ§Ø¦Ù†Ù¹' },
    desc: { en: 'Render each PDF page as a full-slide image in a PPTX. The slide preserves a page image, not editable text or objects; review output size and image clarity.', ur: 'ہر PDF صفحہ PPTX میں تصویر والی سلائیڈ بنے گا۔ شکل برقرار رہے گی مگر مواد edit نہیں ہوگا۔' },
    keywords: ['powerpoint', 'pptx', 'slides', 'convert', 'Ù¾Ø§ÙˆØ±Ù¾ÙˆØ§Ø¦Ù†Ù¹'],
  },
  {
    slug: 'protect-pdf',
    category: 'secure',
    status: 'working',
    icon: FileLock2,
    accepts: 'pdf',
    name: { en: 'Protect PDF', ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ù…Ø­ÙÙˆØ¸ Ú©Ø±ÛŒÚº' },
    desc: { en: 'Encrypt a PDF with an AES-256 opening password. Keep the password safe; it cannot be recovered.', ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ù…Ø­ÙÙˆØ¸ Ú©Ø±ÛŒÚº' },
    keywords: ['protect', 'password', 'encrypt', 'lock', 'secure', 'Ù¾Ø§Ø³ ÙˆØ±Úˆ'],
  },
  {
    slug: 'unlock-pdf',
    category: 'secure',
    status: 'working',
    icon: LockOpen,
    accepts: 'pdf',
    name: { en: 'Unlock PDF', ur: 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ø§Ù† Ù„Ø§Ú© Ú©Ø±ÛŒÚº' },
    desc: { en: 'Decrypt a PDF you are authorized to access using its correct password. Password recovery is not available.', ur: 'Ø§Ø³ Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ø³Û’ Ù¾Ø§Ø³ ÙˆØ±Úˆ ÛÙ¹Ø§Ø¦ÛŒÚº Ø¬Ø³Û’ Ú©Ú¾ÙˆÙ„Ù†Û’ Ú©ÛŒ Ø¢Ù¾ Ú©Ùˆ Ø§Ø¬Ø§Ø²Øª ÛÛ’Û”' },
    keywords: ['unlock', 'password', 'decrypt', 'remove password', 'Ø§Ù† Ù„Ø§Ú©'],
  },
]


TOOLS.push(
  { slug: 'pdf-ocr', category: 'edit', status: 'working', icon: ScanText, accepts: 'pdf', name: { en: 'PDF OCR', ur: 'PDF OCR' }, desc: { en: 'Add searchable English text to scanned PDF pages with browser OCR. The English language model must be downloaded; review recognition accuracy.', ur: 'براؤزر OCR سے scanned صفحات میں English متن پہچان کر searchable text شامل کریں۔ English model ڈاؤن لوڈ ہوگا۔' }, keywords: ['ocr', 'scan', 'recognize'] },
  { slug: 'pdf-compare', category: 'secure', status: 'working', icon: GitCompare, accepts: 'pdf', multiple: true, name: { en: 'Compare PDFs', ur: 'PDF Compare' }, desc: { en: 'Compare selectable text and page counts in two PDFs. The report does not detect visual, image, or layout changes.', ur: 'Compare PDF text.' }, keywords: ['compare', 'diff', 'versions'] },
  { slug: 'pdf-page-editor', category: 'edit', status: 'working', icon: Edit3, accepts: 'pdf', name: { en: 'PDF Page Editor', ur: 'PDF Page Editor' }, desc: { en: 'Reorder pages with thumbnail previews. Use the dedicated rotate, remove and crop tools for other page edits.', ur: 'Reorder pages using thumbnails.' }, keywords: ['page editor', 'crop', 'margin'] },
  { slug: 'pdf-metadata', category: 'edit', status: 'working', icon: SlidersHorizontal, accepts: 'pdf', name: { en: 'PDF Metadata Editor', ur: 'PDF Metadata Editor' }, desc: { en: 'Edit a PDF’s title, author, subject, and keywords. Leave a field blank to clear its current value.', ur: 'PDF metadata editor.' }, keywords: ['metadata', 'title', 'author'] },
  { slug: 'batch-processing', category: 'organize', status: 'working', icon: ListChecks, accepts: 'pdf', multiple: true, name: { en: 'Batch Processing', ur: 'Batch Processing' }, desc: { en: 'Apply one operation to multiple PDFs: optimize, remove standard metadata, or rotate pages 90°. Results download as a ZIP.', ur: 'Batch processing.' }, keywords: ['batch', 'bulk', 'queue'] },
)

TOOLS.push(
  { slug: 'remove-pages', category: 'organize', status: 'working', icon: FileMinus, accepts: 'pdf', name: { en: 'Remove Pages', ur: 'Remove Pages' }, desc: { en: 'Remove selected pages and keep the remaining document.', ur: 'Remove selected pages.' }, keywords: ['remove', 'delete', 'pages'] },
  { slug: 'organize-pages', category: 'organize', status: 'working', icon: ArrowDownUp, accepts: 'pdf', name: { en: 'Organize Pages', ur: 'Organize Pages' }, desc: { en: 'Reorder PDF pages into the exact sequence you need.', ur: 'Reorder PDF pages.' }, keywords: ['organize', 'reorder', 'pages'] },
  { slug: 'rearrange-pages', category: 'organize', status: 'working', icon: ArrowDownUp, accepts: 'pdf', name: { en: 'Rearrange Pages', ur: 'Rearrange Pages' }, desc: { en: 'Move PDF pages into a new order.', ur: 'Rearrange PDF pages.' }, keywords: ['rearrange', 'reorder', 'move'] },
  { slug: 'duplicate-pages', category: 'organize', status: 'working', icon: Layers, accepts: 'pdf', name: { en: 'Duplicate Pages', ur: 'Duplicate Pages' }, desc: { en: 'Select pages and add copies after the original document’s pages. Review the new page order before downloading.', ur: 'Duplicate selected PDF pages.' }, keywords: ['duplicate', 'copy', 'pages'] },
  { slug: 'repair-pdf', category: 'optimize', status: 'working', icon: FileArchive, accepts: 'pdf', name: { en: 'Repair PDF', ur: 'Repair PDF' }, desc: { en: 'Rebuild pages that PDF.js can render as a raster PDF. Selectable text, links, forms, and original metadata are not retained.', ur: 'Repair damaged PDF.' }, keywords: ['repair', 'recover', 'damaged'] },
  { slug: 'flatten-pdf', category: 'optimize', status: 'working', icon: FileText, accepts: 'pdf', name: { en: 'Flatten PDF Forms', ur: 'Flatten PDF Forms' }, desc: { en: 'Turn interactive AcroForm fields into static page content. Comments and annotations are not flattened.', ur: 'Flatten PDF form fields.' }, keywords: ['flatten', 'forms', 'annotations'] },
  { slug: 'optimize-pdf', category: 'optimize', status: 'working', icon: SlidersHorizontal, accepts: 'pdf', name: { en: 'Optimize PDF', ur: 'Optimize PDF' }, desc: { en: 'Rewrite PDF objects in compact streams without rasterizing pages. The output may not be smaller than the original.', ur: 'Optimize PDF object structure.' }, keywords: ['optimize', 'object streams', 'reduce'] },
  { slug: 'remove-metadata', category: 'optimize', status: 'working', icon: SlidersHorizontal, accepts: 'pdf', name: { en: 'Remove Metadata', ur: 'Remove Metadata' }, desc: { en: 'Remove standard document properties and catalog XMP metadata. Metadata inside page content and images is not inspected.', ur: 'Remove PDF metadata.' }, keywords: ['metadata', 'privacy', 'remove'] },
  { slug: 'png-to-pdf', category: 'convert-to', status: 'working', icon: Image, accepts: 'image', multiple: true, name: { en: 'PNG to PDF', ur: 'PNG to PDF' }, desc: { en: 'Convert PNG images into one PDF document.', ur: 'Convert PNG to PDF.' }, keywords: ['png', 'image', 'convert'] },
  { slug: 'txt-to-pdf', category: 'convert-to', status: 'working', icon: FileText, accepts: 'text', name: { en: 'TXT to PDF', ur: 'TXT to PDF' }, desc: { en: 'Convert plain text files into paginated PDFs using a basic Latin font.', ur: 'Convert text to PDF.' }, keywords: ['txt', 'text', 'convert'] },
  { slug: 'html-to-pdf', category: 'convert-to', status: 'working', icon: FileText, accepts: 'html', name: { en: 'HTML to PDF', ur: 'HTML to PDF' }, desc: { en: 'Extract readable text from a local HTML file and paginate it as a basic PDF; styling and images are not retained.', ur: 'Convert HTML text to PDF.' }, keywords: ['html', 'web', 'convert'] },
  { slug: 'heic-to-pdf', category: 'convert-to', status: 'working', icon: Image, accepts: 'heic', multiple: true, name: { en: 'HEIC to PDF', ur: 'HEIC to PDF' }, desc: { en: 'Convert HEIC/HEIF photos into PDF pages in your browser. Source metadata is not retained.', ur: 'HEIC/HEIF تصاویر کو براؤزر میں PDF صفحات بنائیں۔ اصل metadata محفوظ نہیں ہوتا۔' }, keywords: ['heic', 'heif', 'iphone', 'image'] },
  { slug: 'pdf-to-png', category: 'convert-from', status: 'working', icon: FileImage, accepts: 'pdf', name: { en: 'PDF to PNG', ur: 'PDF to PNG' }, desc: { en: 'Render PDF pages as PNG images at a chosen resolution. Download separate images or bundle multiple pages in a ZIP.', ur: 'Convert PDF to PNG.' }, keywords: ['png', 'image', 'convert'] },
  { slug: 'pdf-to-text', category: 'convert-from', status: 'working', icon: FileText, accepts: 'pdf', name: { en: 'PDF to Text', ur: 'PDF to Text' }, desc: { en: 'Extract selectable text into a plain text file with page boundaries. Scanned pages need OCR first.', ur: 'Extract PDF text.' }, keywords: ['text', 'extract', 'convert'] },
  { slug: 'pdf-to-html', category: 'convert-from', status: 'working', icon: FileText, accepts: 'pdf', name: { en: 'PDF to HTML', ur: 'PDF to HTML' }, desc: { en: 'Export selectable PDF text into a simple page-separated HTML layout.', ur: 'Convert PDF text to HTML.' }, keywords: ['html', 'web', 'convert'] },
  { slug: 'pdf-to-pdfa', category: 'convert-from', status: 'soon', icon: FileArchive, accepts: 'pdf', name: { en: 'PDF to PDF/A', ur: 'PDF to PDF/A' }, desc: { en: 'Convert a PDF for long-term archival compatibility.', ur: 'Convert PDF to PDF/A.' }, keywords: ['pdfa', 'archive', 'convert'] },
  { slug: 'add-images', category: 'edit', status: 'working', icon: Image, accepts: 'pdf', name: { en: 'Add Images', ur: 'Add Images' }, desc: { en: 'Place a JPG or PNG image in the center of each page, scaled to fit. Check it does not cover important content.', ur: 'Add images to PDF.' }, keywords: ['image', 'edit', 'place'] },
  { slug: 'add-text', category: 'edit', status: 'working', icon: Edit3, accepts: 'pdf', name: { en: 'Add Text', ur: 'Add Text' }, desc: { en: 'Stamp basic Latin text at the bottom-left of every page. Choose a font size; this is not a full PDF text editor.', ur: 'Add text to PDF.' }, keywords: ['text', 'edit', 'write'] },
  { slug: 'header-footer', category: 'edit', status: 'working', icon: FileText, accepts: 'pdf', name: { en: 'Header and Footer', ur: 'Header and Footer' }, desc: { en: 'Add a repeating text header, footer, or both to every page. Choose a font size and review placement before sharing.', ur: 'Add PDF headers and footers.' }, keywords: ['header', 'footer', 'page'] },
  { slug: 'highlight-pdf', category: 'edit', status: 'working', icon: Edit3, accepts: 'pdf', name: { en: 'Highlight PDF', ur: 'Highlight PDF' }, desc: { en: 'Highlight selectable text runs containing a word or phrase. Scanned pages require OCR first.', ur: 'منتخب متن میں لفظ یا عبارت کو highlight کریں۔ Scanned صفحات کے لیے پہلے OCR کریں۔' }, keywords: ['highlight', 'annotate', 'mark'] },
  { slug: 'annotate-pdf', category: 'edit', status: 'working', icon: Edit3, accepts: 'pdf', name: { en: 'Annotate PDF', ur: 'Annotate PDF' }, desc: { en: 'Add a visible flattened note to selected pages. Notes are not interactive PDF comments.', ur: 'منتخب صفحات پر واضح flattened نوٹ شامل کریں۔ یہ interactive PDF comments نہیں ہیں۔' }, keywords: ['annotate', 'comment', 'review'] },
  { slug: 'draw-pdf', category: 'edit', status: 'working', icon: PenLine, accepts: 'pdf', name: { en: 'Draw on PDF', ur: 'Draw on PDF' }, desc: { en: 'Draw a freehand mark and place it visibly on a selected PDF page.', ur: 'نشان بنا کر منتخب PDF صفحے پر لگائیں۔' }, keywords: ['draw', 'freehand', 'pen'] },
  { slug: 'crop-pdf', category: 'edit', status: 'working', icon: ScanText, accepts: 'pdf', name: { en: 'Crop PDF', ur: 'Crop PDF' }, desc: { en: 'Set page margins to change the visible crop area. Cropping does not erase hidden content and is not a redaction method.', ur: 'Crop PDF pages.' }, keywords: ['crop', 'margin', 'trim'] },
  { slug: 'digital-signature', category: 'secure', status: 'soon', icon: PenLine, accepts: 'pdf', name: { en: 'Digital Signature', ur: 'Digital Signature' }, desc: { en: 'Apply a certificate-backed digital signature when configured.', ur: 'Digital signature.' }, keywords: ['digital', 'certificate', 'signature'] },
  { slug: 'redact-pdf', category: 'secure', status: 'working', icon: FileLock2, accepts: 'pdf', name: { en: 'Redact PDF', ur: 'Redact PDF' }, desc: { en: 'Find selectable text and rasterize all pages with the matching text permanently masked. Review the output before sharing.', ur: 'منتخب متن تلاش کرکے تمام صفحات کو نشان زدہ متن چھپا کر تصویر بنائیں۔ شیئر کرنے سے پہلے نتیجہ دیکھیں۔' }, keywords: ['redact', 'privacy', 'sensitive'] },
  { slug: 'extract-images', category: 'advanced', status: 'working', icon: FileImage, accepts: 'pdf', name: { en: 'Extract Images', ur: 'Extract Images' }, desc: { en: 'Export embedded raster images from a PDF as individual PNG files. Vector artwork and full-page backgrounds are not extracted.', ur: 'PDF میں شامل raster تصاویر الگ PNG فائلوں میں حاصل کریں۔ Vector artwork اور پورے صفحے کے backgrounds شامل نہیں ہوں گے۔' }, keywords: ['extract', 'images', 'pdf'] },
  { slug: 'extract-tables', category: 'advanced', status: 'working', icon: FileSpreadsheet, accepts: 'pdf', name: { en: 'Extract Tables', ur: 'Extract Tables' }, desc: { en: 'Heuristically group positioned text into CSV rows and columns; review results for complex layouts.', ur: 'Extract PDF tables.' }, keywords: ['tables', 'extract', 'spreadsheet'] },
  { slug: 'extract-metadata', category: 'advanced', status: 'working', icon: SlidersHorizontal, accepts: 'pdf', name: { en: 'Extract Metadata', ur: 'Extract PDF metadata.' }, desc: { en: 'Read a PDF’s title, author, dates, page count, and page dimensions, then download a JSON metadata report.', ur: 'Extract PDF metadata.' }, keywords: ['metadata', 'properties', 'author'] },
  { slug: 'pdf-to-markdown', category: 'advanced', status: 'working', icon: FileText, accepts: 'pdf', name: { en: 'PDF to Markdown', ur: 'PDF to Markdown' }, desc: { en: 'Export selectable PDF text with page headings in Markdown. Scanned pages need OCR; complex layout is not retained.', ur: 'Convert PDF to Markdown.' }, keywords: ['markdown', 'text', 'convert'] },
  { slug: 'pdf-to-json', category: 'advanced', status: 'working', icon: FileText, accepts: 'pdf', name: { en: 'PDF to JSON', ur: 'PDF to JSON' }, desc: { en: 'Export selectable page text and dimensions as JSON. Scanned pages need OCR; layout is not reconstructed.', ur: 'Convert PDF to JSON.' }, keywords: ['json', 'structure', 'convert'] },
  { slug: 'pdf-to-csv', category: 'advanced', status: 'working', icon: FileSpreadsheet, accepts: 'pdf', name: { en: 'PDF to CSV', ur: 'PDF to CSV' }, desc: { en: 'Export positioned PDF text into CSV rows and columns using a best-effort layout heuristic.', ur: 'Convert PDF text to CSV.' }, keywords: ['csv', 'tables', 'convert'] },
  { slug: 'pdf-translator', category: 'advanced', status: 'working', icon: ScanText, accepts: 'pdf', name: { en: 'PDF Translator', ur: 'PDF Translator' }, desc: { en: 'Translate selectable PDF text into the language you choose with Google Gemini.', ur: 'منتخب PDF متن کو Google Gemini سے اپنی پسند کی زبان میں ترجمہ کریں۔' }, keywords: ['translate', 'language', 'pdf'] },
  { slug: 'chat-with-pdf', category: 'ai', status: 'working', icon: ScanText, accepts: 'pdf', name: { en: 'Chat with PDF', ur: 'PDF سے بات کریں' }, desc: { en: 'Ask follow-up questions about selectable PDF text using Google Gemini.', ur: 'Google Gemini سے PDF کے منتخب متن کے بارے میں سوالات پوچھیں۔' }, keywords: ['ai', 'chat', 'questions'] },
  { slug: 'ai-pdf-summarizer', category: 'ai', status: 'working', icon: ScanText, accepts: 'pdf', name: { en: 'AI PDF Summarizer', ur: 'AI PDF کا خلاصہ' }, desc: { en: 'Create a concise, evidence-based summary of selectable PDF text after approving the AI request.', ur: 'PDF کے منتخب متن کا مختصر، مستند خلاصہ بنائیں۔' }, keywords: ['ai', 'summary', 'summarize'] },
  { slug: 'ai-document-qa', category: 'ai', status: 'working', icon: ListChecks, accepts: 'pdf', name: { en: 'AI Document Q&A', ur: 'AI دستاویز سوال و جواب' }, desc: { en: 'Ask a document question and receive an evidence-grounded answer based only on its selectable text.', ur: 'دستاویز کے متن پر مبنی سوال پوچھیں اور جواب حاصل کریں۔' }, keywords: ['ai', 'questions', 'answer'] },
  { slug: 'ai-document-translator', category: 'ai', status: 'working', icon: ScanText, accepts: 'pdf', name: { en: 'AI Document Translator', ur: 'AI دستاویز مترجم' }, desc: { en: 'Translate selectable document text into a target language with Gemini.', ur: 'Gemini سے منتخب دستاویزی متن کا مطلوبہ زبان میں ترجمہ کریں۔' }, keywords: ['ai', 'translation', 'language'] },
  { slug: 'ai-key-points', category: 'ai', status: 'working', icon: ListChecks, accepts: 'pdf', name: { en: 'AI Key Points Extractor', ur: 'AI اہم نکات' }, desc: { en: 'Extract the key points and explicitly stated action items from selectable PDF text with Gemini assistance.', ur: 'PDF سے اہم نکات اور درج شدہ کام نکالیں۔' }, keywords: ['ai', 'key points', 'extract'] },
  { slug: 'ai-report-generator', category: 'ai', status: 'working', icon: Edit3, accepts: 'pdf', name: { en: 'AI Report Generator', ur: 'AI رپورٹ جنریٹر' }, desc: { en: 'Generate a structured report grounded in the evidence and content of a PDF after your explicit consent.', ur: 'PDF کے مواد پر مبنی منظم رپورٹ بنائیں۔' }, keywords: ['ai', 'report', 'generator'] },
)

export const TOOL_REDIRECTS: Record<string, string> = {
  'remove-pages': 'delete-pages',
  'organize-pages': 'reorder-pages',
  'rearrange-pages': 'reorder-pages',
  'pdf-page-editor': 'reorder-pages',
  'pdf-to-csv': 'extract-tables',
  'png-to-pdf': 'jpg-to-pdf',
}

export const LISTED_TOOLS = TOOLS.filter(
  (tool) => tool.status === 'working' && !TOOL_REDIRECTS[tool.slug],
)

export const POPULAR = ['merge-pdf', 'split-pdf', 'compress-pdf', 'sign-pdf', 'pdf-to-jpg']

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug)

const CATEGORY_LABELS: Record<CategoryId, string[]> = {
  'convert-to': ['convert to pdf', 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ù…ÛŒÚº ØªØ¨Ø¯ÛŒÙ„ Ú©Ø±ÛŒÚº'],
  'convert-from': ['convert from pdf', 'Ù¾ÛŒ ÚˆÛŒ Ø§ÛŒÙ Ø³Û’ ØªØ¨Ø¯ÛŒÙ„ Ú©Ø±ÛŒÚº'],
  organize: ['organize', 'organise', 'ØªØ±ØªÛŒØ¨ Ø¯ÛŒÚº'],
  optimize: ['optimize', 'compress', 'shrink'],
  edit: ['edit', 'ØªØ±Ù…ÛŒÙ…'],
  secure: ['secure', 'security', 'Ø­ÙØ§Ø¸Øª'],
  advanced: ['advanced', 'extract', 'tables', 'ocr'],
  ai: ['ai', 'chat', 'summarize', 'translator'],
}

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/)
  return LISTED_TOOLS.map((tool) => {
    const haystack = [
      tool.name.en,
      tool.name.ur,
      tool.desc.en,
      tool.desc.ur,
      tool.slug.replace(/-/g, ' '),
      ...CATEGORY_LABELS[tool.category],
      ...tool.keywords,
    ]
      .join(' ')
      .toLowerCase()
    if (!terms.every((term) => haystack.includes(term))) return null
    const nameHit = tool.name.en.toLowerCase().includes(q) || tool.name.ur.includes(q)
    return { tool, score: (nameHit ? 2 : 0) + (tool.status === 'working' ? 1 : 0) }
  })
    .filter((x): x is { tool: Tool; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.tool)
}

export function toolsForFiles(kind: 'pdf' | 'image'): Tool[] {
  return TOOLS.filter((t) => t.status === 'working' && t.accepts === kind)
}
