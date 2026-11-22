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
  Scissors,
  Stamp,
  type LucideIcon,
} from 'lucide-react'

export type CategoryId = 'convert-to' | 'convert-from' | 'organize' | 'edit' | 'secure'

export const CATEGORIES: CategoryId[] = ['organize', 'edit', 'convert-to', 'convert-from', 'secure']

export type Tool = {
  slug: string
  category: CategoryId
  status: 'working' | 'soon'
  icon: LucideIcon
  accepts: 'pdf' | 'image'
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
    name: { en: 'Merge PDFs', ur: 'پی ڈی ایف یکجا کریں' },
    desc: {
      en: 'Combine several PDFs into one file, in the order you choose.',
      ur: 'کئی پی ڈی ایف فائلوں کو اپنی مرضی کی ترتیب میں ایک فائل میں جوڑیں۔',
    },
    keywords: ['combine', 'join', 'append', 'merge', 'jorna', 'یکجا'],
  },
  {
    slug: 'split-pdf',
    category: 'organize',
    status: 'working',
    icon: Scissors,
    accepts: 'pdf',
    name: { en: 'Split PDF', ur: 'پی ڈی ایف تقسیم کریں' },
    desc: {
      en: 'Split a PDF by page ranges or into single pages. Download as a ZIP or separately.',
      ur: 'پی ڈی ایف کو صفحات کی حدود یا الگ الگ صفحات میں تقسیم کریں۔ ZIP یا الگ ڈاؤن لوڈ کریں۔',
    },
    keywords: ['split', 'separate', 'divide', 'cut', 'ranges', 'تقسیم'],
  },
  {
    slug: 'rotate-pdf',
    category: 'organize',
    status: 'working',
    icon: RotateCw,
    accepts: 'pdf',
    name: { en: 'Rotate PDF', ur: 'پی ڈی ایف گھمائیں' },
    desc: {
      en: 'Rotate all pages, or just the ones you pick, by 90°, 180° or 270°.',
      ur: 'تمام صفحات یا منتخب صفحات کو 90°، 180° یا 270° گھمائیں۔',
    },
    keywords: ['rotate', 'turn', 'orientation', 'landscape', 'portrait', 'گھمائیں'],
  },
  {
    slug: 'delete-pages',
    category: 'organize',
    status: 'working',
    icon: FileMinus,
    accepts: 'pdf',
    name: { en: 'Delete Pages', ur: 'صفحات حذف کریں' },
    desc: {
      en: 'Remove the pages you don’t need and keep the rest.',
      ur: 'غیر ضروری صفحات ہٹائیں اور باقی رکھیں۔',
    },
    keywords: ['delete', 'remove', 'pages', 'drop', 'حذف'],
  },
  {
    slug: 'extract-pages',
    category: 'organize',
    status: 'working',
    icon: FileOutput,
    accepts: 'pdf',
    name: { en: 'Extract Pages', ur: 'صفحات نکالیں' },
    desc: {
      en: 'Pick pages and save them as a new PDF.',
      ur: 'صفحات منتخب کریں اور انہیں نئی پی ڈی ایف کے طور پر محفوظ کریں۔',
    },
    keywords: ['extract', 'select', 'pages', 'pull', 'نکالیں'],
  },
  {
    slug: 'reorder-pages',
    category: 'organize',
    status: 'working',
    icon: ArrowDownUp,
    accepts: 'pdf',
    name: { en: 'Reorder Pages', ur: 'صفحات کی ترتیب بدلیں' },
    desc: {
      en: 'See every page as a thumbnail and move pages up or down.',
      ur: 'ہر صفحہ تصویر کی شکل میں دیکھیں اور اوپر یا نیچے منتقل کریں۔',
    },
    keywords: ['reorder', 'sort', 'arrange', 'organize', 'move', 'ترتیب'],
  },
  {
    slug: 'compress-pdf',
    category: 'edit',
    status: 'working',
    icon: FileArchive,
    accepts: 'pdf',
    name: { en: 'Compress PDF', ur: 'پی ڈی ایف کمپریس کریں' },
    desc: {
      en: 'Shrink a PDF by redrawing its pages as JPEG images at the quality you choose.',
      ur: 'صفحات کو آپ کی منتخب کوالٹی پر JPEG تصاویر بنا کر پی ڈی ایف کا سائز کم کریں۔',
    },
    note: {
      en: 'Text becomes part of the page images, so it can no longer be selected or searched.',
      ur: 'متن صفحے کی تصویر کا حصہ بن جاتا ہے، اس لیے منتخب یا تلاش نہیں ہو سکے گا۔',
    },
    keywords: ['compress', 'reduce', 'shrink', 'smaller', 'size', 'optimize', 'کمپریس'],
  },
  {
    slug: 'sign-pdf',
    category: 'edit',
    status: 'working',
    icon: PenLine,
    accepts: 'pdf',
    name: { en: 'Sign PDF', ur: 'پی ڈی ایف پر دستخط' },
    desc: {
      en: 'Draw or type your signature and place it on any page.',
      ur: 'اپنے دستخط بنائیں یا ٹائپ کریں اور کسی بھی صفحے پر لگائیں۔',
    },
    note: {
      en: 'This adds a visible signature image. It is not a certificate-based digital signature.',
      ur: 'یہ دستخط کی تصویر شامل کرتا ہے، سرٹیفکیٹ والا ڈیجیٹل دستخط نہیں۔',
    },
    keywords: ['sign', 'signature', 'esign', 'autograph', 'دستخط'],
  },
  {
    slug: 'add-page-numbers',
    category: 'edit',
    status: 'working',
    icon: Hash,
    accepts: 'pdf',
    name: { en: 'Add Page Numbers', ur: 'صفحہ نمبر لگائیں' },
    desc: {
      en: 'Number your pages, choosing position, style and starting number.',
      ur: 'صفحات پر نمبر لگائیں، جگہ، انداز اور ابتدائی نمبر منتخب کریں۔',
    },
    keywords: ['page numbers', 'numbering', 'paginate', 'footer', 'نمبر'],
  },
  {
    slug: 'add-watermark',
    category: 'edit',
    status: 'working',
    icon: Stamp,
    accepts: 'pdf',
    name: { en: 'Add Watermark', ur: 'واٹر مارک لگائیں' },
    desc: {
      en: 'Stamp text such as “CONFIDENTIAL” across every page.',
      ur: 'ہر صفحے پر “CONFIDENTIAL” جیسا متن لگائیں۔',
    },
    keywords: ['watermark', 'stamp', 'confidential', 'draft', 'واٹر مارک'],
  },
  {
    slug: 'jpg-to-pdf',
    category: 'convert-to',
    status: 'working',
    icon: Image,
    accepts: 'image',
    multiple: true,
    name: { en: 'JPG to PDF', ur: 'JPG سے پی ڈی ایف' },
    desc: {
      en: 'Turn JPG or PNG images into a PDF, one image per page.',
      ur: 'JPG یا PNG تصاویر کو پی ڈی ایف میں بدلیں، ہر صفحے پر ایک تصویر۔',
    },
    keywords: ['jpg', 'jpeg', 'png', 'image', 'photo', 'picture', 'convert', 'تصویر'],
  },
  {
    slug: 'word-to-pdf',
    category: 'convert-to',
    status: 'soon',
    icon: FileText,
    accepts: 'pdf',
    name: { en: 'Word to PDF', ur: 'ورڈ سے پی ڈی ایف' },
    desc: { en: 'Convert DOC and DOCX documents to PDF.', ur: 'DOC اور DOCX دستاویزات کو پی ڈی ایف میں بدلیں۔' },
    keywords: ['word', 'docx', 'doc', 'convert', 'ورڈ'],
  },
  {
    slug: 'excel-to-pdf',
    category: 'convert-to',
    status: 'soon',
    icon: FileSpreadsheet,
    accepts: 'pdf',
    name: { en: 'Excel to PDF', ur: 'ایکسل سے پی ڈی ایف' },
    desc: { en: 'Convert XLS and XLSX spreadsheets to PDF.', ur: 'XLS اور XLSX اسپریڈشیٹس کو پی ڈی ایف میں بدلیں۔' },
    keywords: ['excel', 'xlsx', 'spreadsheet', 'convert', 'ایکسل'],
  },
  {
    slug: 'powerpoint-to-pdf',
    category: 'convert-to',
    status: 'soon',
    icon: Presentation,
    accepts: 'pdf',
    name: { en: 'PowerPoint to PDF', ur: 'پاورپوائنٹ سے پی ڈی ایف' },
    desc: { en: 'Convert PPT and PPTX slides to PDF.', ur: 'PPT اور PPTX سلائیڈز کو پی ڈی ایف میں بدلیں۔' },
    keywords: ['powerpoint', 'pptx', 'slides', 'presentation', 'پاورپوائنٹ'],
  },
  {
    slug: 'pdf-to-jpg',
    category: 'convert-from',
    status: 'working',
    icon: FileImage,
    accepts: 'pdf',
    name: { en: 'PDF to JPG', ur: 'پی ڈی ایف سے JPG' },
    desc: {
      en: 'Save every page as a JPG image. Multiple pages download as a ZIP.',
      ur: 'ہر صفحہ JPG تصویر کے طور پر محفوظ کریں۔ کئی صفحات ZIP میں ملیں گے۔',
    },
    keywords: ['jpg', 'jpeg', 'image', 'convert', 'export', 'picture', 'تصویر'],
  },
  {
    slug: 'pdf-to-word',
    category: 'convert-from',
    status: 'soon',
    icon: FileText,
    accepts: 'pdf',
    name: { en: 'PDF to Word', ur: 'پی ڈی ایف سے ورڈ' },
    desc: { en: 'Turn a PDF into an editable DOCX document.', ur: 'پی ڈی ایف کو قابل ترمیم DOCX دستاویز میں بدلیں۔' },
    keywords: ['word', 'docx', 'convert', 'editable', 'ورڈ'],
  },
  {
    slug: 'pdf-to-excel',
    category: 'convert-from',
    status: 'soon',
    icon: FileSpreadsheet,
    accepts: 'pdf',
    name: { en: 'PDF to Excel', ur: 'پی ڈی ایف سے ایکسل' },
    desc: { en: 'Pull tables from a PDF into an XLSX spreadsheet.', ur: 'پی ڈی ایف کی جدولیں XLSX اسپریڈشیٹ میں نکالیں۔' },
    keywords: ['excel', 'xlsx', 'tables', 'convert', 'ایکسل'],
  },
  {
    slug: 'pdf-to-powerpoint',
    category: 'convert-from',
    status: 'soon',
    icon: Presentation,
    accepts: 'pdf',
    name: { en: 'PDF to PowerPoint', ur: 'پی ڈی ایف سے پاورپوائنٹ' },
    desc: { en: 'Turn PDF pages into PPTX slides.', ur: 'پی ڈی ایف صفحات کو PPTX سلائیڈز میں بدلیں۔' },
    keywords: ['powerpoint', 'pptx', 'slides', 'convert', 'پاورپوائنٹ'],
  },
  {
    slug: 'protect-pdf',
    category: 'secure',
    status: 'soon',
    icon: FileLock2,
    accepts: 'pdf',
    name: { en: 'Protect PDF', ur: 'پی ڈی ایف محفوظ کریں' },
    desc: { en: 'Add a password so only people who know it can open the file.', ur: 'پاس ورڈ لگائیں تاکہ صرف جاننے والے فائل کھول سکیں۔' },
    keywords: ['protect', 'password', 'encrypt', 'lock', 'secure', 'پاس ورڈ'],
  },
  {
    slug: 'unlock-pdf',
    category: 'secure',
    status: 'soon',
    icon: LockOpen,
    accepts: 'pdf',
    name: { en: 'Unlock PDF', ur: 'پی ڈی ایف ان لاک کریں' },
    desc: { en: 'Remove the password from a PDF you are allowed to open.', ur: 'اس پی ڈی ایف سے پاس ورڈ ہٹائیں جسے کھولنے کی آپ کو اجازت ہے۔' },
    keywords: ['unlock', 'password', 'decrypt', 'remove password', 'ان لاک'],
  },
]

export const POPULAR = ['merge-pdf', 'split-pdf', 'compress-pdf', 'sign-pdf', 'pdf-to-jpg']

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug)

const CATEGORY_LABELS: Record<CategoryId, string[]> = {
  'convert-to': ['convert to pdf', 'پی ڈی ایف میں تبدیل کریں'],
  'convert-from': ['convert from pdf', 'پی ڈی ایف سے تبدیل کریں'],
  organize: ['organize', 'organise', 'ترتیب دیں'],
  edit: ['edit', 'ترمیم'],
  secure: ['secure', 'security', 'حفاظت'],
}

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/)
  return TOOLS.map((tool) => {
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
