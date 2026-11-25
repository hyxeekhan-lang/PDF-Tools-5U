import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window { __pdfpilotThirdPartyAdLoaded?: Set<string> }
}

const CONSENT_KEY = 'pdfpilot5u-cookie-consent-v3'
const enabled = import.meta.env.VITE_THIRD_PARTY_ADS_ENABLED === 'true'
const providerHost = 'bicea.org'
const units = {
  1: { key: '2831834a178db11caa5b4182c5fb1c28', width: 728, height: 90 },
  2: { key: '3ff7854a7fd2bc7238f42d56110b052e', width: 300, height: 250 },
  3: { key: '0a1201f1d926c750b04eac8fba57164c', width: 320, height: 50 },
} as const

/**
 * Provider-neutral, opt-in display slot. It intentionally renders nothing until
 * a verified provider host, code URL, container ID, and consent are configured.
 * Provider scripts are never mixed with the Google AdSense component.
 */
export function ThirdPartyAdUnit({ slot, label = 'Advertisements' }: { slot: 1 | 2 | 3; label?: string }) {
  const [allowed, setAllowed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const unit = units[slot]
  const configured = enabled && Boolean(unit)

  useEffect(() => {
    const update = () => setAllowed(window.localStorage.getItem(CONSENT_KEY) === 'all')
    update()
    const onConsent = () => update()
    window.addEventListener('pdfpilot5u:consent-changed', onConsent)
    return () => window.removeEventListener('pdfpilot5u:consent-changed', onConsent)
  }, [])

  useEffect(() => {
    if (!configured || !allowed || !ref.current) return
    const key = `${providerHost}|${unit.key}`
    window.__pdfpilotThirdPartyAdLoaded ??= new Set()
    if (window.__pdfpilotThirdPartyAdLoaded.has(key)) return
    const options = document.createElement('script')
    options.text = `window.atOptions={key:'${unit.key}',format:'iframe',height:${unit.height},width:${unit.width},params:{}};`
    ref.current.appendChild(options)
    const script = document.createElement('script')
    script.async = true
    script.src = `https://${providerHost}/22/${unit.key}`
    script.dataset.pdfpilotThirdPartyAd = 'true'
    ref.current.appendChild(script)
    window.__pdfpilotThirdPartyAdLoaded.add(key)
  }, [allowed, configured])

  if (!configured || !allowed) return null
  return <aside className="my-10 flex min-h-24 items-center justify-center overflow-hidden text-center" aria-label={label}>
    <div><span className="mb-2 block text-xs uppercase tracking-wider text-muted">{label}</span><div ref={ref} style={{ minHeight: unit.height, maxWidth: '100%', overflow: 'hidden' }} /></div>
  </aside>
}
