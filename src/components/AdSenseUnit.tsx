import { useEffect, useState } from 'react'

const CONSENT_KEY = 'pdfpilot5u-cookie-consent-v2'
const units = {
  1: { key: '201b4d97cd029236911f9ed306872b0c', width: 468, height: 60 },
  2: { key: '3ff7854a7fd2bc7238f42d56110b052e', width: 300, height: 250 },
  3: { key: '2831834a178db11caa5b4182c5fb1c28', width: 728, height: 90 },
} as const

export function AdSenseUnit({ slot }: { slot: 1 | 2 | 3 }) {
  const [allowed, setAllowed] = useState(false)
  const unit = units[slot]

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

  return (
    <aside className="my-10 flex min-h-24 items-center justify-center overflow-hidden text-center" aria-label="Advertisements">
      <div>
        <span className="mb-2 block text-xs uppercase tracking-wider text-muted">Advertisements</span>
        {allowed ? (
          <iframe
            title={`Advertisement ${slot}`}
            className="mx-auto block max-w-full border-0"
            style={{ width: `min(100%, ${unit.width}px)`, height: unit.height }}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            srcDoc={`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;display:flex;justify-content:center;overflow:hidden"><script>var atOptions={key:'${unit.key}',format:'iframe',height:${unit.height},width:${unit.width},params:{}};<\/script><script async data-cfasync="false" src="https://bicea.org/22/${unit.key}"><\/script></body></html>`}
          />
        ) : (
          <span className="block text-xs text-muted">Accept all cookies to load advertisements.</span>
        )}
      </div>
    </aside>
  )
}
