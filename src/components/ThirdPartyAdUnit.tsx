import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window { __pdfpilotThirdPartyAdLoaded?: Set<string> }
}

const CONSENT_KEY = 'pdfpilot5u-cookie-consent-v3'
const enabled = import.meta.env.VITE_THIRD_PARTY_ADS_ENABLED === 'true'
const scriptUrl = import.meta.env.VITE_THIRD_PARTY_ADS_SCRIPT_URL?.trim() ?? ''
const containerId = import.meta.env.VITE_THIRD_PARTY_ADS_CONTAINER_ID?.trim() ?? ''
const allowedHost = import.meta.env.VITE_THIRD_PARTY_ADS_ALLOWED_HOST?.trim().toLowerCase() ?? ''

function safeScriptUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(allowedHost) && url.hostname.toLowerCase() === allowedHost
  } catch {
    return false
  }
}

/**
 * Provider-neutral, opt-in display slot. It intentionally renders nothing until
 * a verified provider host, code URL, container ID, and consent are configured.
 * Provider scripts are never mixed with the Google AdSense component.
 */
export function ThirdPartyAdUnit({ label = 'Advertisements' }: { label?: string }) {
  const [allowed, setAllowed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const configured = enabled && safeScriptUrl(scriptUrl) && Boolean(containerId)

  useEffect(() => {
    const update = () => setAllowed(window.localStorage.getItem(CONSENT_KEY) === 'all')
    update()
    const onConsent = () => update()
    window.addEventListener('pdfpilot5u:consent-changed', onConsent)
    return () => window.removeEventListener('pdfpilot5u:consent-changed', onConsent)
  }, [])

  useEffect(() => {
    if (!configured || !allowed || !ref.current) return
    const key = `${scriptUrl}|${containerId}`
    window.__pdfpilotThirdPartyAdLoaded ??= new Set()
    if (window.__pdfpilotThirdPartyAdLoaded.has(key)) return
    const script = document.createElement('script')
    script.async = true
    script.src = scriptUrl
    script.dataset.pdfpilotThirdPartyAd = 'true'
    ref.current.appendChild(script)
    window.__pdfpilotThirdPartyAdLoaded.add(key)
  }, [allowed, configured])

  if (!configured || !allowed) return null
  return <aside className="my-10 flex min-h-24 items-center justify-center overflow-hidden text-center" aria-label={label}>
    <div><span className="mb-2 block text-xs uppercase tracking-wider text-muted">{label}</span><div ref={ref} id={containerId} /></div>
  </aside>
}
