import { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '#/lib/i18n'
import { LogoMark } from './Logo'

type InstallPrompt = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

declare global {
  interface Window {
    __pdfpilot5uInstallPrompt?: InstallPrompt | null
  }
}

let deferredPrompt: InstallPrompt | null = null
let listening = false
const subscribers = new Set<(prompt: InstallPrompt | null) => void>()

function publishPrompt(prompt: InstallPrompt | null) {
  deferredPrompt = prompt
  for (const subscriber of subscribers) subscriber(prompt)
}

function subscribeToInstallPrompt(subscriber: (prompt: InstallPrompt | null) => void) {
  if (!listening) {
    listening = true
    window.addEventListener('pdfpilot5u-install-prompt', () => {
      publishPrompt(window.__pdfpilot5uInstallPrompt ?? null)
    })
  }
  subscribers.add(subscriber)
  const prompt = window.__pdfpilot5uInstallPrompt ?? deferredPrompt
  if (prompt !== deferredPrompt) publishPrompt(prompt)
  else subscriber(prompt)
  return () => {
    subscribers.delete(subscriber)
  }
}

async function requestInstall() {
  const prompt = deferredPrompt
  if (!prompt) return false
  window.__pdfpilot5uInstallPrompt = null
  publishPrompt(null)
  await prompt.prompt()
  return (await prompt.userChoice).outcome === 'accepted'
}

export function InstallAppButton({ className = '' }: { className?: string }) {
  const { t, tr } = useI18n()
  const instructionsId = useId()
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [error, setError] = useState('')
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    return subscribeToInstallPrompt(setPrompt)
  }, [])

  const getInstructions = () => {
    const userAgent = navigator.userAgent
    const isIOS =
      /iPad|iPhone|iPod/.test(userAgent) ||
      (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1)

    if (isIOS) {
      return tr(
        'In Safari, tap Share, then choose “Add to Home Screen”.',
        'Safari میں Share پر ٹیپ کریں، پھر “Add to Home Screen” منتخب کریں۔',
      )
    }

    if (/Android/.test(userAgent)) {
      return tr(
        'In your browser menu, choose “Install app” or “Add to Home screen”, if available.',
        'براؤزر مینو میں “Install app” یا “Add to Home screen” منتخب کریں، اگر دستیاب ہو۔',
      )
    }

    return tr(
      'This browser did not provide a one-tap install prompt. In Chrome or Edge, open the browser menu and choose “Install PDF Pilot 5U”, if available.',
      'اس براؤزر نے ایک ٹیپ سے انسٹال کرنے کا اختیار نہیں دیا۔ Chrome یا Edge میں براؤزر مینو کھولیں اور “Install PDF Pilot 5U” منتخب کریں، اگر دستیاب ہو۔',
    )
  }

  const install = async () => {
    setError('')
    if (!prompt) {
      setInstructions(getInstructions())
      setShowInstructions(true)
      return
    }

    setInstalling(true)
    try {
      const accepted = await requestInstall()
      if (accepted) {
        setShowInstructions(false)
      } else {
        setInstructions(getInstructions())
        setShowInstructions(true)
      }
    } catch (cause) {
      console.error('PDF Pilot 5U native install prompt failed.', cause)
      setInstructions(getInstructions())
      setError(
        tr(
          'The install prompt could not be opened. You can try installing from your browser menu.',
          'انسٹال کا اختیار نہیں کھل سکا۔ آپ براؤزر مینو سے انسٹال کرنے کی کوشش کر سکتے ہیں۔',
        ),
      )
      setShowInstructions(true)
    } finally {
      setInstalling(false)
    }
  }

  const noticeIsOpen = showInstructions || Boolean(error)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void install()}
        aria-expanded={noticeIsOpen}
        aria-controls={noticeIsOpen ? instructionsId : undefined}
        disabled={installing}
        className={className}
      >
        {t('footer.install')}
      </button>
      {noticeIsOpen && (
        <div
          id={instructionsId}
          role="group"
          aria-labelledby={`${instructionsId}-title`}
          className="absolute end-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-card p-4 text-start shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-start gap-3">
            <LogoMark className="size-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 id={`${instructionsId}-title`} className="text-sm font-bold text-ink">
                {tr('Install PDF Pilot 5U', 'PDF Pilot 5U انسٹال کریں')}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">{instructions}</p>
              {error && (
                <p className="mt-2 text-xs leading-relaxed text-accent" role="alert">
                  {error}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowInstructions(false)
                setError('')
              }}
              aria-label={tr('Close install instructions', 'انسٹال کی ہدایات بند کریں')}
              className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-blush hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
