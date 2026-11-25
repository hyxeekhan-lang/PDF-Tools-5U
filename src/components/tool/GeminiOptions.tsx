import { useEffect, useRef, useState, type FormEvent } from 'react'
import { LoaderCircle, X } from 'lucide-react'
import { useI18n } from '#/lib/i18n'
import { baseName, downloadBlob, pdfToText } from '#/lib/pdf'
import { getNeonClient, isNeonConfigured } from '#/lib/neon'
import { AuthForm } from '#/components/AuthForm'

type AiAction = 'summary' | 'question' | 'translate' | 'key-points' | 'report' | 'chat'
type ChatMessage = { role: 'user' | 'model'; content: string }

const ACTIONS: Record<string, AiAction> = {
  'chat-with-pdf': 'chat',
  'ai-pdf-summarizer': 'summary',
  'ai-document-qa': 'question',
  'ai-document-translator': 'translate',
  'pdf-translator': 'translate',
  'ai-key-points': 'key-points',
  'ai-report-generator': 'report',
}

const BUTTON_LABELS: Record<AiAction, { en: string; ur: string }> = {
  chat: { en: 'Ask about this PDF', ur: 'PDF کے بارے میں پوچھیں' },
  summary: { en: 'Summarize PDF', ur: 'PDF کا خلاصہ کریں' },
  question: { en: 'Answer my question', ur: 'میرے سوال کا جواب دیں' },
  translate: { en: 'Translate PDF text', ur: 'PDF کا متن ترجمہ کریں' },
  'key-points': { en: 'Extract key points', ur: 'اہم نکات نکالیں' },
  report: { en: 'Generate report', ur: 'رپورٹ بنائیں' },
}

export function GeminiOptions({ files, toolSlug }: { files: File[]; toolSlug: string }) {
  const { tr, pick } = useI18n()
  const action = ACTIONS[toolSlug]
  const isChat = action === 'chat'
  const needsQuestion = action === 'question' || isChat
  const needsLanguage = action === 'translate'
  const [consent, setConsent] = useState(false)
  const [question, setQuestion] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('Urdu')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [extractionProgress, setExtractionProgress] = useState<number | null>(null)
  const [showAccountPrompt, setShowAccountPrompt] = useState(false)
  const [error, setError] = useState('')
  const textCache = useRef<{ file: File; text: string } | null>(null)

  useEffect(() => {
    textCache.current = null
    setMessages([])
    setAnswer('')
    setQuestion('')
    setShowAccountPrompt(false)
    setError('')
  }, [files[0]])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!consent) {
      setError('Please agree before sending extracted text to Google Gemini.')
      return
    }
    if ((needsQuestion && !question.trim()) || (needsLanguage && !targetLanguage.trim())) {
      setError(needsQuestion ? 'Enter a question about this PDF.' : 'Enter a target language.')
      return
    }

    setBusy(true)
    setAnswer('')
    setShowAccountPrompt(false)
    setStatus(tr('Extracting selectable PDF text on this device…', 'منتخب PDF متن اسی آلے پر نکالا جا رہا ہے…'))
    setExtractionProgress(0)
    try {
      const file = files[0]
      let documentText = textCache.current?.file === file ? textCache.current.text : ''
      if (!documentText) {
        const [textOutput] = await pdfToText(file, (fraction) => {
          setExtractionProgress(Math.round(fraction * 100))
        })
        documentText = await textOutput.blob.text()
        documentText = documentText.replace(/^--- Page \d+ ---\s*$/gm, '').trim()
        if (!documentText) throw new Error('No selectable text was found. Run OCR on this scanned PDF first.')
        if (documentText.length > 60_000) throw new Error('This PDF contains too much text for one AI request. Split it into smaller files first.')
        textCache.current = { file, text: documentText }
      }
      setExtractionProgress(null)

      let signedIn = false
      if (isNeonConfigured()) {
        try {
          const { data: sessionData, error: sessionError } = await getNeonClient().auth.getSession()
          if (sessionError) console.error('Could not check the optional Neon session for the AI sign-in prompt.', sessionError)
          else signedIn = Boolean(sessionData.session)
        } catch (cause) {
          console.error('Could not check the optional Neon session for the AI sign-in prompt.', cause)
        }
      }

      setStatus(tr('Sending the text you approved to Gemini…', 'آپ کی اجازت سے متن Gemini کو بھیجا جا رہا ہے…'))
      const outgoingMessages = isChat
        ? [...messages, { role: 'user' as const, content: question.trim() }].slice(-8)
        : undefined
      const request = fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          text: documentText,
          question: action === 'question' ? question.trim() : undefined,
          targetLanguage: needsLanguage ? targetLanguage.trim() : undefined,
          messages: outgoingMessages,
        }),
      })
      setStatus(tr('Gemini is preparing your result…', 'Gemini آپ کا نتیجہ تیار کر رہا ہے…'))
      const response = await request

      let result: { text?: unknown; error?: unknown }
      try {
        result = await response.json() as { text?: unknown; error?: unknown }
      } catch {
        throw new Error('The AI service returned an invalid response. Try again.')
      }
      if (!response.ok)
        throw new Error(typeof result.error === 'string' ? result.error : 'The AI request failed. Try again.')
      if (typeof result.text !== 'string' || !result.text.trim())
        throw new Error('Gemini returned an empty answer. Try a more specific request.')

      if (isChat) {
        if (!outgoingMessages) throw new Error('The chat request could not be prepared.')
        setMessages([...outgoingMessages, { role: 'model', content: result.text }])
        setQuestion('')
      } else {
        setAnswer(result.text)
      }
      setShowAccountPrompt(!signedIn)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The AI request failed. Try again.')
    } finally {
      setBusy(false)
      setStatus('')
      setExtractionProgress(null)
    }
  }

  const downloadAnswer = () => {
    if (!answer) return
    downloadBlob({
      name: `${baseName(files[0].name)}-${toolSlug}.txt`,
      blob: new Blob([answer], { type: 'text/plain;charset=utf-8' }),
    })
  }

  const accountPrompt = showAccountPrompt && (
    <aside className="space-y-3 rounded-2xl border border-line bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold">{tr('Your result is ready', 'آپ کا نتیجہ تیار ہے')}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {tr(
              'Sign-in is optional. Keep using the tool as a guest, or sign in for account features.',
              'سائن اِن اختیاری ہے۔ مہمان کے طور پر ٹول استعمال کریں یا اکاؤنٹ فیچرز کے لیے سائن اِن کریں۔',
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAccountPrompt(false)}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-card px-3 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="size-3.5" aria-hidden="true" />
          {tr('Continue as guest', 'مہمان کے طور پر جاری رکھیں')}
        </button>
      </div>
      <AuthForm mode="login" compact onSuccess={() => setShowAccountPrompt(false)} />
    </aside>
  )

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        {tr(
          'Selectable text is extracted on your device. Scanned PDFs need OCR first. After you consent, only the extracted text is sent to Google Gemini; the PDF file itself is not uploaded.',
          'منتخب متن آپ کے آلے پر نکالا جاتا ہے۔ Scanned PDF کے لیے پہلے OCR کریں۔ اجازت کے بعد صرف متن Google Gemini کو بھیجا جاتا ہے؛ PDF فائل upload نہیں ہوتی۔',
        )}
      </p>

      {isChat && messages.length > 0 && (
        <div className={`grid gap-4 ${showAccountPrompt ? 'lg:grid-cols-[minmax(0,1fr)_22rem]' : ''}`}>
          <ol className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-line bg-paper p-4" aria-live="polite">
            {messages.map((message, index) => (
              <li key={`${message.role}-${index}`} className={`max-w-[90%] whitespace-pre-wrap rounded-xl px-4 py-3 text-sm ${message.role === 'user' ? 'ms-auto bg-accent text-white' : 'bg-card text-ink'}`}>
                {message.content}
              </li>
            ))}
          </ol>
          {accountPrompt}
        </div>
      )}

      <form className="space-y-4" onSubmit={(event) => void submit(event)}>
        {needsQuestion && (
          <label className="block space-y-2 text-sm font-semibold">
            <span>{tr(isChat ? 'Your question' : 'Question about the document', isChat ? 'آپ کا سوال' : 'دستاویز کے بارے میں سوال')}</span>
            <textarea
              className="min-h-28 w-full resize-y rounded-xl border border-line bg-paper px-3.5 py-3 text-[15px] outline-none focus:border-accent/60"
              maxLength={2_000}
              required
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={tr('Ask a question the PDF can answer…', 'ایسا سوال پوچھیں جس کا جواب PDF میں ہو…')}
            />
          </label>
        )}
        {needsLanguage && (
          <label className="block space-y-2 text-sm font-semibold">
            <span>{tr('Translate into', 'ترجمہ کریں')}</span>
            <input
              className="min-h-11 w-full rounded-xl border border-line bg-paper px-3.5 text-[15px] outline-none focus:border-accent/60"
              maxLength={80}
              required
              value={targetLanguage}
              onChange={(event) => setTargetLanguage(event.target.value)}
            />
          </label>
        )}
        <label className="flex items-start gap-3 rounded-xl border border-line bg-paper p-4 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-accent"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            {tr(
              'I agree to send the extracted text from this PDF to Google Gemini to complete this request.',
              'میں اس درخواست کے لیے PDF کا نکالا ہوا متن Google Gemini کو بھیجنے کی اجازت دیتا/دیتی ہوں۔',
            )}
          </span>
        </label>

        {error && <p role="alert" className="rounded-xl border border-accent/30 bg-blush px-4 py-3 text-sm font-medium text-accent-dark">{error}</p>}
        {busy && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-busy="true"
            className="rounded-2xl border border-line bg-paper p-4"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blush text-accent">
                <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{status}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  {tr('Keep this tab open while your request is processing.', 'درخواست مکمل ہونے تک یہ ٹیب کھلا رکھیں۔')}
                </p>
              </div>
            </div>
            {extractionProgress !== null && (
              <div className="mt-4 flex items-center gap-3">
                <div
                  role="progressbar"
                  aria-label={tr('PDF text extraction progress', 'PDF متن نکالنے کی پیش رفت')}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={extractionProgress}
                  className="h-2 flex-1 overflow-hidden rounded-full bg-line"
                >
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-300"
                    style={{ width: `${extractionProgress}%` }}
                  />
                </div>
                <span className="w-10 text-end text-xs font-semibold tabular-nums text-muted">{extractionProgress}%</span>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !consent}
          className="press inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-sm hover:bg-accent-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {busy ? tr('Working…', 'کام جاری ہے…') : pick(BUTTON_LABELS[action])}
        </button>
      </form>

      {!isChat && answer && (
        <div className={`grid gap-4 ${showAccountPrompt ? 'lg:grid-cols-[minmax(0,1fr)_22rem]' : ''}`}>
          <section className="space-y-3 rounded-xl border border-line bg-paper p-4" aria-live="polite">
            <h3 className="font-display font-bold">{tr('AI result', 'AI نتیجہ')}</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
            <button type="button" onClick={downloadAnswer} className="min-h-10 rounded-full border border-line px-4 text-sm font-semibold hover:border-accent">
              {tr('Download as text', 'Text ڈاؤن لوڈ کریں')}
            </button>
          </section>
          {accountPrompt}
        </div>
      )}
    </div>
  )
}
