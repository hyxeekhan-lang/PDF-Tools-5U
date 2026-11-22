import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type Lang = 'en' | 'ur'

const en = {
  'nav.features': 'Features',
  'nav.tools': 'Tools',
  'nav.pricing': 'Pricing',
  'nav.blog': 'Blog',
  'nav.about': 'About',
  'nav.myFiles': 'My Files',
  'nav.getStarted': 'Get Started',
  'nav.allTools': 'All tools',
  'nav.menu': 'Menu',
  'nav.theme': 'Toggle dark mode',
  'nav.language': 'Switch language',

  'cat.convert-to': 'Convert to PDF',
  'cat.convert-from': 'Convert from PDF',
  'cat.organize': 'Organize',
  'cat.edit': 'Edit',
  'cat.secure': 'Secure',

  'hero.badge': 'Free PDF Tools',
  'hero.title': 'PDFs, made simple.',
  'hero.free': 'Free.',
  'hero.subtitle': 'Compress, merge, convert, and edit PDFs right in your browser.',
  'hero.drop': 'Drop a file to get started',
  'hero.formats': 'PDF, JPG, PNG - up to 100 MB',
  'hero.choose': 'Choose file',
  'hero.or': 'or',
  'hero.local': 'Files are processed in your browser and never uploaded.',
  'hero.picked': 'What do you want to do with',
  'hero.pickedMany': 'files',
  'hero.reset': 'Choose a different file',
  'hero.unsupported': 'That file type isn’t supported. Choose a PDF, JPG or PNG.',
  'hero.tooBig': 'That file is larger than 100 MB.',
  'search.placeholder': 'Search tools, e.g. merge, compress, sign…',
  'search.none': 'No tools match your search.',
  'popular.title': 'Popular Tools',

  'all.title': 'Every tool, grouped by what you need',
  'all.subtitle': 'Tools marked “Coming soon” need conversion engines that can’t run in a browser yet. We list them honestly instead of pretending.',
  'tool.soon': 'Coming soon',
  'tool.open': 'Open tool',

  'why.eyebrow': 'Why PDFTools',
  'why.title': 'Simple tools that respect your files',
  'why.1.t': 'Browser-based',
  'why.1.d': 'Files stay on your device. Processing happens in this browser tab.',
  'why.2.t': 'No sign-up needed',
  'why.2.d': 'Open a tool and use it. No account, no email, no waiting.',
  'why.3.t': 'Free to use',
  'why.3.d': 'Every working tool is free. There is no paid tier.',
  'why.4.t': 'Works on desktop and mobile',
  'why.4.d': 'Use it in any modern browser on a laptop, tablet or phone.',

  'how.eyebrow': 'How it works',
  'how.title': 'Three steps, all in your browser',
  'how.1.t': 'Upload',
  'how.1.d': 'Pick or drop your file. It is read by your browser, not sent anywhere.',
  'how.2.t': 'Process',
  'how.2.d': 'Choose your options and press the button. Progress is shown page by page.',
  'how.3.t': 'Download',
  'how.3.d': 'Save the result straight to your device.',

  'sec.eyebrow': 'Security & privacy',
  'sec.title': 'Your files never leave your device',
  'sec.body': 'PDFTools runs entirely in your browser using open-source libraries (pdf-lib and PDF.js). When you choose a file, it is read into this tab’s memory and processed there. We have no upload server, so there is nothing to store, scan or leak.',
  'sec.1': 'No file uploads: processing happens on your device',
  'sec.2': 'Results are created locally and downloaded directly',
  'sec.3': '“My Files” keeps recent results only in this browser, and you can clear them anytime',
  'sec.4': 'Close the tab and the in-memory copy is gone',

  'price.eyebrow': 'Pricing',
  'price.title': 'One plan. It’s free.',
  'price.plan': 'Free',
  'price.amount': '$0',
  'price.note': 'no account, no card',
  'price.i1': 'All working tools, unlimited use',
  'price.i2': 'Files up to 100 MB',
  'price.i3': 'Processed in your browser',
  'price.i4': 'No watermark added to your files',
  'price.cta': 'Start using PDFTools',

  'faq.title': 'Questions',
  'faq.1.q': 'Are my files uploaded to a server?',
  'faq.1.a': 'No. Every working tool runs in your browser. Your file is read into this tab’s memory, processed, and handed back to you as a download.',
  'faq.2.q': 'Is it really free?',
  'faq.2.a': 'Yes. There is no paid plan and no sign-up.',
  'faq.3.q': 'Why are some tools “Coming soon”?',
  'faq.3.a': 'Converting Word, Excel or PowerPoint files, and reading text from scans, needs heavy engines that don’t run well in a browser. Rather than fake them, we list them as coming soon.',
  'faq.4.q': 'Does Compress PDF keep my text selectable?',
  'faq.4.a': 'No. Compression redraws each page as a JPEG image, so text becomes part of the picture and can no longer be selected or searched. Keep your original if you need the text.',
  'faq.5.q': 'Can I open password-protected PDFs?',
  'faq.5.a': 'Not yet. Protect and Unlock are coming soon. Other tools will tell you if a file is encrypted.',
  'faq.6.q': 'What is the file size limit?',
  'faq.6.a': '100 MB per file. Very large files depend on your device’s memory.',

  'footer.tagline': 'Free PDF tools that run in your browser. Files are processed on your device and never uploaded.',
  'footer.company': 'Company',
  'footer.legal': 'Legal',
  'footer.tools': 'Tools',
  'footer.about': 'About Us',
  'footer.contact': 'Contact',
  'footer.privacy': 'Privacy Policy',
  'footer.terms': 'Terms of Service',
  'footer.refund': 'Refund Policy',
  'footer.cookies': 'Cookie Policy',
  'footer.help': 'Help Center',
  'footer.blog': 'Blog',

  'page.upload': 'Choose file',
  'page.uploadMany': 'Choose files',
  'page.dropHere': 'Drop your file here',
  'page.dropHereMany': 'Drop your files here',
  'page.limit': 'up to 100 MB each',
  'page.addMore': 'Add more',
  'page.remove': 'Remove',
  'page.options': 'Options',
  'page.process': 'Process',
  'page.processing': 'Processing…',
  'page.done': 'Done! Your file is ready.',
  'page.doneMany': 'Done! Your files are ready.',
  'page.download': 'Download',
  'page.downloadAll': 'Download all (ZIP)',
  'page.startOver': 'Start over',
  'page.localNote': 'Processed in your browser. Your file is never uploaded.',
  'page.moveUp': 'Move up',
  'page.moveDown': 'Move down',
  'page.page': 'Page',
  'page.pages': 'pages',
  'page.selected': 'selected',
  'page.selectAll': 'Select all',
  'page.clear': 'Clear',
  'page.loadingPages': 'Loading pages…',
  'page.soonTitle': 'This tool is coming soon',
  'page.soonBody': 'It needs a conversion engine that can’t run in your browser yet. We’d rather tell you than show a button that doesn’t work. Try one of these working tools instead:',
  'page.related': 'Other tools',
  'page.savedToMyFiles': 'Also saved to My Files in this browser.',

  'files.title': 'My Files',
  'files.subtitle': 'Results you created recently, stored only in this browser (IndexedDB). They are not on any server, and clearing your browser data removes them.',
  'files.empty': 'No files yet. Results from any tool will appear here.',
  'files.clear': 'Clear all',
  'files.delete': 'Delete',
}

type Key = keyof typeof en

const ur: Record<Key, string> = {
  'nav.features': 'خصوصیات',
  'nav.tools': 'ٹولز',
  'nav.pricing': 'قیمت',
  'nav.blog': 'بلاگ',
  'nav.about': 'ہمارے بارے میں',
  'nav.myFiles': 'میری فائلیں',
  'nav.getStarted': 'شروع کریں',
  'nav.allTools': 'تمام ٹولز',
  'nav.menu': 'مینو',
  'nav.theme': 'ڈارک موڈ',
  'nav.language': 'زبان بدلیں',

  'cat.convert-to': 'پی ڈی ایف میں تبدیل کریں',
  'cat.convert-from': 'پی ڈی ایف سے تبدیل کریں',
  'cat.organize': 'ترتیب دیں',
  'cat.edit': 'ترمیم',
  'cat.secure': 'حفاظت',

  'hero.badge': 'مفت پی ڈی ایف ٹولز',
  'hero.title': 'پی ڈی ایف، آسان۔',
  'hero.free': 'مفت۔',
  'hero.subtitle': 'اپنے براؤزر میں ہی پی ڈی ایف کو کمپریس، یکجا، تبدیل اور ترمیم کریں۔',
  'hero.drop': 'شروع کرنے کے لیے فائل یہاں ڈالیں',
  'hero.formats': 'PDF، JPG، PNG - زیادہ سے زیادہ 100 MB',
  'hero.choose': 'فائل منتخب کریں',
  'hero.or': 'یا',
  'hero.local': 'فائلیں آپ کے براؤزر میں پروسیس ہوتی ہیں اور کبھی اپ لوڈ نہیں ہوتیں۔',
  'hero.picked': 'آپ اس کے ساتھ کیا کرنا چاہتے ہیں:',
  'hero.pickedMany': 'فائلیں',
  'hero.reset': 'دوسری فائل منتخب کریں',
  'hero.unsupported': 'یہ فائل قسم معاون نہیں۔ PDF، JPG یا PNG منتخب کریں۔',
  'hero.tooBig': 'یہ فائل 100 MB سے بڑی ہے۔',
  'search.placeholder': 'ٹولز تلاش کریں، مثلاً یکجا، کمپریس، دستخط…',
  'search.none': 'کوئی ٹول نہیں ملا۔',
  'popular.title': 'مقبول ٹولز',

  'all.title': 'ہر ٹول، آپ کی ضرورت کے مطابق',
  'all.subtitle': '“جلد آ رہا ہے” والے ٹولز کو ایسے انجن درکار ہیں جو ابھی براؤزر میں نہیں چل سکتے۔ ہم انہیں ایمانداری سے دکھاتے ہیں۔',
  'tool.soon': 'جلد آ رہا ہے',
  'tool.open': 'ٹول کھولیں',

  'why.eyebrow': 'PDFTools کیوں',
  'why.title': 'آسان ٹولز جو آپ کی فائلوں کا احترام کرتے ہیں',
  'why.1.t': 'براؤزر پر مبنی',
  'why.1.d': 'فائلیں آپ کے آلے پر رہتی ہیں۔ پروسیسنگ اسی براؤزر ٹیب میں ہوتی ہے۔',
  'why.2.t': 'سائن اپ کی ضرورت نہیں',
  'why.2.d': 'ٹول کھولیں اور استعمال کریں۔ نہ اکاؤنٹ، نہ ای میل۔',
  'why.3.t': 'مفت استعمال',
  'why.3.d': 'ہر کام کرنے والا ٹول مفت ہے۔ کوئی ادائیگی والا پلان نہیں۔',
  'why.4.t': 'ڈیسک ٹاپ اور موبائل پر',
  'why.4.d': 'لیپ ٹاپ، ٹیبلٹ یا فون کے کسی بھی جدید براؤزر میں استعمال کریں۔',

  'how.eyebrow': 'یہ کیسے کام کرتا ہے',
  'how.title': 'تین مراحل، سب آپ کے براؤزر میں',
  'how.1.t': 'اپ لوڈ',
  'how.1.d': 'فائل منتخب کریں۔ اسے آپ کا براؤزر پڑھتا ہے، کہیں بھیجا نہیں جاتا۔',
  'how.2.t': 'پروسیس',
  'how.2.d': 'اختیارات چنیں اور بٹن دبائیں۔ پیش رفت صفحہ بہ صفحہ دکھائی جاتی ہے۔',
  'how.3.t': 'ڈاؤن لوڈ',
  'how.3.d': 'نتیجہ سیدھا اپنے آلے پر محفوظ کریں۔',

  'sec.eyebrow': 'سیکیورٹی اور رازداری',
  'sec.title': 'آپ کی فائلیں آپ کے آلے سے باہر نہیں جاتیں',
  'sec.body': 'PDFTools مکمل طور پر آپ کے براؤزر میں اوپن سورس لائبریریوں (pdf-lib اور PDF.js) کے ذریعے چلتا ہے۔ فائل اسی ٹیب کی میموری میں پڑھی اور پروسیس کی جاتی ہے۔ ہمارا کوئی اپ لوڈ سرور نہیں۔',
  'sec.1': 'کوئی فائل اپ لوڈ نہیں: پروسیسنگ آپ کے آلے پر',
  'sec.2': 'نتائج مقامی طور پر بنتے اور براہ راست ڈاؤن لوڈ ہوتے ہیں',
  'sec.3': '“میری فائلیں” حالیہ نتائج صرف اسی براؤزر میں رکھتا ہے، جنہیں آپ کبھی بھی حذف کر سکتے ہیں',
  'sec.4': 'ٹیب بند کریں اور میموری والی کاپی ختم',

  'price.eyebrow': 'قیمت',
  'price.title': 'ایک پلان۔ مفت۔',
  'price.plan': 'مفت',
  'price.amount': '$0',
  'price.note': 'نہ اکاؤنٹ، نہ کارڈ',
  'price.i1': 'تمام کام کرنے والے ٹولز، لامحدود استعمال',
  'price.i2': '100 MB تک فائلیں',
  'price.i3': 'آپ کے براؤزر میں پروسیسنگ',
  'price.i4': 'آپ کی فائلوں پر کوئی واٹر مارک نہیں',
  'price.cta': 'PDFTools استعمال کریں',

  'faq.title': 'سوالات',
  'faq.1.q': 'کیا میری فائلیں سرور پر اپ لوڈ ہوتی ہیں؟',
  'faq.1.a': 'نہیں۔ ہر کام کرنے والا ٹول آپ کے براؤزر میں چلتا ہے۔ فائل اسی ٹیب میں پروسیس ہو کر ڈاؤن لوڈ کے طور پر واپس ملتی ہے۔',
  'faq.2.q': 'کیا یہ واقعی مفت ہے؟',
  'faq.2.a': 'جی ہاں۔ نہ کوئی ادائیگی والا پلان ہے، نہ سائن اپ۔',
  'faq.3.q': 'کچھ ٹولز “جلد آ رہا ہے” کیوں ہیں؟',
  'faq.3.a': 'ورڈ، ایکسل یا پاورپوائنٹ کی تبدیلی اور اسکین سے متن پڑھنے کے لیے بھاری انجن چاہییں جو براؤزر میں اچھے نہیں چلتے۔ ہم انہیں جعلی بنانے کے بجائے جلد آنے والا لکھتے ہیں۔',
  'faq.4.q': 'کیا کمپریس کے بعد متن منتخب ہو سکے گا؟',
  'faq.4.a': 'نہیں۔ کمپریشن ہر صفحے کو JPEG تصویر بنا دیتا ہے، اس لیے متن تصویر کا حصہ بن جاتا ہے۔ اگر متن چاہیے تو اصل فائل رکھیں۔',
  'faq.5.q': 'کیا پاس ورڈ والی پی ڈی ایف کھل سکتی ہے؟',
  'faq.5.a': 'ابھی نہیں۔ Protect اور Unlock جلد آ رہے ہیں۔ دوسرے ٹولز بتا دیں گے اگر فائل خفیہ ہو۔',
  'faq.6.q': 'فائل سائز کی حد کیا ہے؟',
  'faq.6.a': 'فی فائل 100 MB۔ بہت بڑی فائلیں آپ کے آلے کی میموری پر منحصر ہیں۔',

  'footer.tagline': 'مفت پی ڈی ایف ٹولز جو آپ کے براؤزر میں چلتے ہیں۔ فائلیں آپ کے آلے پر پروسیس ہوتی ہیں اور اپ لوڈ نہیں ہوتیں۔',
  'footer.company': 'کمپنی',
  'footer.legal': 'قانونی',
  'footer.tools': 'ٹولز',
  'footer.about': 'ہمارے بارے میں',
  'footer.contact': 'رابطہ',
  'footer.privacy': 'رازداری کی پالیسی',
  'footer.terms': 'شرائط و ضوابط',
  'footer.refund': 'رقم کی واپسی کی پالیسی',
  'footer.cookies': 'کوکی پالیسی',
  'footer.help': 'مدد مرکز',
  'footer.blog': 'بلاگ',

  'page.upload': 'فائل منتخب کریں',
  'page.uploadMany': 'فائلیں منتخب کریں',
  'page.dropHere': 'اپنی فائل یہاں ڈالیں',
  'page.dropHereMany': 'اپنی فائلیں یہاں ڈالیں',
  'page.limit': 'ہر ایک زیادہ سے زیادہ 100 MB',
  'page.addMore': 'مزید شامل کریں',
  'page.remove': 'ہٹائیں',
  'page.options': 'اختیارات',
  'page.process': 'پروسیس کریں',
  'page.processing': 'پروسیس ہو رہا ہے…',
  'page.done': 'مکمل! آپ کی فائل تیار ہے۔',
  'page.doneMany': 'مکمل! آپ کی فائلیں تیار ہیں۔',
  'page.download': 'ڈاؤن لوڈ',
  'page.downloadAll': 'سب ڈاؤن لوڈ کریں (ZIP)',
  'page.startOver': 'دوبارہ شروع کریں',
  'page.localNote': 'آپ کے براؤزر میں پروسیس ہوئی۔ فائل کبھی اپ لوڈ نہیں ہوئی۔',
  'page.moveUp': 'اوپر',
  'page.moveDown': 'نیچے',
  'page.page': 'صفحہ',
  'page.pages': 'صفحات',
  'page.selected': 'منتخب',
  'page.selectAll': 'سب منتخب کریں',
  'page.clear': 'صاف کریں',
  'page.loadingPages': 'صفحات لوڈ ہو رہے ہیں…',
  'page.soonTitle': 'یہ ٹول جلد آ رہا ہے',
  'page.soonBody': 'اسے ایسا انجن چاہیے جو ابھی آپ کے براؤزر میں نہیں چل سکتا۔ ہم ایسا بٹن نہیں دکھاتے جو کام نہ کرے۔ یہ کام کرنے والے ٹولز آزمائیں:',
  'page.related': 'دیگر ٹولز',
  'page.savedToMyFiles': 'اسی براؤزر میں “میری فائلیں” میں بھی محفوظ ہو گئی۔',

  'files.title': 'میری فائلیں',
  'files.subtitle': 'حالیہ نتائج، صرف اسی براؤزر (IndexedDB) میں محفوظ۔ یہ کسی سرور پر نہیں ہیں، اور براؤزر ڈیٹا صاف کرنے سے حذف ہو جاتے ہیں۔',
  'files.empty': 'ابھی کوئی فائل نہیں۔ کسی بھی ٹول کے نتائج یہاں نظر آئیں گے۔',
  'files.clear': 'سب حذف کریں',
  'files.delete': 'حذف کریں',
}

export type TKey = Key

const dict: Record<Lang, Record<Key, string>> = { en, ur }

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (k: Key) => string
  pick: <T>(v: { en: T; ur: T }) => T
  tr: (en: string, ur: string) => string
}

const I18nContext = createContext<Ctx | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('pdftools-lang')
    if (saved === 'ur' || saved === 'en') setLangState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem('pdftools-lang', l)
    setLangState(l)
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (k) => dict[lang][k] ?? en[k],
      pick: (v) => v[lang],
      tr: (enText, urText) => (lang === 'ur' ? urText : enText),
    }),
    [lang, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}

export function useTheme() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])
  const toggle = useCallback(() => {
    setDark((d) => {
      const next = !d
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('pdftools-theme', next ? 'dark' : 'light')
      return next
    })
  }, [])
  return { dark, toggle }
}

export const bootScript = `(function(){try{var t=localStorage.getItem('pdftools-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}var l=localStorage.getItem('pdftools-lang');if(l==='ur'){document.documentElement.lang='ur';document.documentElement.dir='rtl'}}catch(e){}})()`
