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
    // Each unit gets its own document so the provider's global atOptions object
    // cannot be overwritten by another slot on the same page.
    window.__pdfpilotThirdPartyAdLoaded.add(key)
  }, [allowed, configured])

  if (!configured || !allowed) return null
  return <aside className="my-10 flex min-h-24 items-center justify-center overflow-hidden text-center" aria-label={label}>
    <div><span className="mb-2 block text-xs uppercase tracking-wider text-muted">{label}</span><div ref={ref} style={{ minHeight: unit.height, maxWidth: '100%', overflow: 'hidden' }}><iframe
      title={`${label} ${unit.width} by ${unit.height}`}
      loading="lazy"
      srcDoc={`<!doctype html><html><body style="margin:0;display:flex;justify-content:center;overflow:hidden"><script>window.atOptions={key:'${unit.key}',format:'iframe',height:${unit.height},width:${unit.width},params:{}};<\/script><script async data-cfasync="false" src="https://${providerHost}/22/${unit.key}"><\/script></body></html>`}
      style={{ display: 'block', width: '100%', maxWidth: unit.width, height: unit.height, border: 0, margin: '0 auto' }}
    /></div></div>
  </aside>
}
