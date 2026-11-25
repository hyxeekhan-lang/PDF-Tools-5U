import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

const CONSENT_KEY = 'pdfpilot5u-cookie-consent-v2'
const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID?.trim() ?? ''
const slots = { 1: import.meta.env.VITE_ADSENSE_SLOT_ID_1?.trim() ?? '', 2: import.meta.env.VITE_ADSENSE_SLOT_ID_2?.trim() ?? '', 3: import.meta.env.VITE_ADSENSE_SLOT_ID_3?.trim() ?? '' } as const
const configured = /^pub-\d{16}$/.test(publisherId) && Object.values(slots).every((slot) => /^\d+$/.test(slot))

export function AdSenseUnit({ slot }: { slot: 1 | 2 | 3 }) {
  const [allowed, setAllowed] = useState(false)
  const adRef = useRef<HTMLElement>(null)
  const hasSlot = configured && Boolean(slots[slot])

  useEffect(() => {
    const update = () => setAllowed(window.localStorage.getItem(CONSENT_KEY) === 'all')
    update()
    window.addEventListener('storage', update)
    window.addEventListener('pdfpilot5u:consent-changed', update)
    return () => {
      window.removeEventListener('storage', update)
      window.removeEventListener('pdfpilot5u:consent-changed', update)
    }
  }, [])

  useEffect(() => {
    if (!allowed || !hasSlot || document.querySelector('script[data-pdfpilot-adsense]')) return
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.dataset.pdfpilotAdsense = 'true'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`
    document.head.appendChild(script)
  }, [allowed, hasSlot])

  useEffect(() => {
    if (!allowed || !hasSlot || !adRef.current) return
    try {
      window.adsbygoogle = window.adsbygoogle ?? []
      window.adsbygoogle.push({})
    } catch (error) {
      console.warn('Google AdSense was not ready for this slot.', error)
    }
  }, [allowed, hasSlot])

  return (
    <aside className="my-10 flex min-h-24 items-center justify-center overflow-hidden text-center" aria-label="Advertisements">
      <div>
        <span className="mb-2 block text-xs uppercase tracking-wider text-muted">Advertisements</span>
        {hasSlot && allowed ? (
          <ins ref={adRef} className="adsbygoogle block min-h-24 overflow-hidden" style={{ display: 'block' }} data-ad-client={publisherId} data-ad-slot={slots[slot]} data-ad-format="auto" data-full-width-responsive="true" />
        ) : (
          <span className="block text-xs text-muted">Advertisements are disabled until an approved Google AdSense configuration is provided.</span>
        )}
      </div>
    </aside>
  )
}
