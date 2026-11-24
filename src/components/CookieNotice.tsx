import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '#/lib/i18n'
import { COOKIE_CONSENT_KEY, OPEN_COOKIE_SETTINGS_EVENT, type CookieConsent } from '#/lib/cookie-consent'
import { setFirebaseAnalyticsConsent } from '#/lib/firebase'

function syncAnalytics(consent: CookieConsent | null) {
  void setFirebaseAnalyticsConsent(consent === 'all').catch((cause) => {
    console.error('Could not apply the saved Firebase Analytics choice.', cause)
  })
}

export function CookieNotice() {
  const { tr } = useI18n()
  const [visible, setVisible] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const showSettings = () => setVisible(true)
    const readConsent = (consent: string | null) => {
      const saved = consent === 'all' || consent === 'essential' ? consent : null
      setVisible(saved === null)
      syncAnalytics(saved)
    }

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, showSettings)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_KEY || event.key === null) readConsent(event.newValue)
    }
    window.addEventListener('storage', handleStorage)

    try {
      readConsent(localStorage.getItem(COOKIE_CONSENT_KEY))
    } catch (cause) {
      setVisible(true)
      setStorageError(tr('Your browser blocked storage. Your choice may not be saved.', 'آپ کے براؤزر نے اسٹوریج بلاک کیا ہے۔ آپ کی پسند محفوظ نہیں ہو سکتی۔'))
      console.error('Could not read the cookie consent choice.', cause)
    }

    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, showSettings)
      window.removeEventListener('storage', handleStorage)
    }
  }, [tr])

  const choose = useCallback(async (consent: CookieConsent) => {
    setBusy(true)
    setStorageError('')
    try {
      await setFirebaseAnalyticsConsent(consent === 'all')
    } catch (cause) {
      setStorageError(tr('We could not apply that choice. Please try again.', 'یہ انتخاب لاگو نہیں ہو سکا۔ دوبارہ کوشش کریں۔'))
      console.error('Could not apply the Firebase Analytics choice.', cause)
      setBusy(false)
      return
    }

    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, consent)
      setVisible(false)
    } catch (cause) {
      setStorageError(tr('Your choice applies for this visit, but could not be saved.', 'آپ کی پسند اس وزٹ کے لیے لاگو ہے، لیکن محفوظ نہیں ہو سکی۔'))
      console.error('Could not save the cookie consent choice.', cause)
    }
    setBusy(false)
  }, [tr])

  if (!visible) return null

  return (
    <aside
      aria-label="Cookie and privacy notice"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-line bg-card p-5 pe-14 shadow-[0_18px_48px_-18px_rgb(16_24_40/0.35)] sm:inset-x-5 sm:bottom-5 sm:flex sm:items-center sm:gap-6 sm:p-6 sm:pe-14"
    >
      <button
        type="button"
        onClick={() => void choose('essential')}
        disabled={busy}
        aria-label={tr('Close and accept only essential cookies', 'بند کریں اور صرف ضروری کوکیز قبول کریں')}
        title={tr('Close and accept only essential cookies', 'بند کریں اور صرف ضروری کوکیز قبول کریں')}
        className="absolute top-3 right-3 grid size-9 place-items-center rounded-full text-muted transition hover:bg-ink/5 hover:text-ink disabled:opacity-50"
      >
        <X className="size-5" aria-hidden />
      </button>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-base font-bold">{tr('Your privacy matters', 'آپ کی رازداری اہم ہے')}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {tr(
            'Essential storage supports preferences, saved files, and sign-in. Optional Firebase Analytics runs only when configured and if you choose Accept all. Ads are not active. Read our',
            'ضروری اسٹوریج ترجیحات، محفوظ فائلوں اور سائن اِن کے لیے ہے۔ اختیاری Firebase Analytics صرف درست ترتیب کے بعد اور “سب قبول کریں” پر چلتا ہے۔ اشتہارات فعال نہیں۔ ہماری',
          )}{' '}
          <Link to="/legal/$page" params={{ page: 'cookies' }} className="font-semibold text-accent underline">
            {tr('Cookie Policy', 'کوکی پالیسی')}
          </Link>
          .
        </p>
        {storageError && (
          <p role="alert" className="mt-2 text-sm font-medium text-accent-dark">
            {storageError}
          </p>
        )}
      </div>
      <div className="mt-4 flex shrink-0 flex-wrap items-center gap-2 sm:mt-0">
        <button
          type="button"
          onClick={() => void choose('all')}
          disabled={busy}
          className="min-h-11 rounded-full bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-wait disabled:opacity-60"
        >
          {tr('Accept all', 'سب قبول کریں')}
        </button>
        <button
          type="button"
          onClick={() => void choose('essential')}
          disabled={busy}
          className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold transition hover:border-accent/50 disabled:cursor-wait disabled:opacity-60"
        >
          {tr('Accept only essential', 'صرف ضروری قبول کریں')}
        </button>
        {storageError && (
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold hover:border-accent/50"
          >
            {tr('Dismiss for this visit', 'اس وزٹ کے لیے بند کریں')}
          </button>
        )}
      </div>
    </aside>
  )
}
