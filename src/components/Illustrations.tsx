const doc = (
  <>
    <rect x="38" y="18" width="64" height="84" rx="10" fill="var(--color-card)" stroke="var(--color-accent)" strokeWidth="2.5" />
    <path d="M82 18v14a6 6 0 0 0 6 6h14" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />
    <rect x="50" y="52" width="40" height="5" rx="2.5" fill="var(--color-accent)" opacity=".25" />
    <rect x="50" y="63" width="30" height="5" rx="2.5" fill="var(--color-accent)" opacity=".25" />
  </>
)

export function UploadArt() {
  return (
    <svg viewBox="0 0 140 120" className="h-28 w-auto" aria-hidden>
      <circle cx="70" cy="62" r="54" fill="var(--color-accent)" opacity=".08" />
      {doc}
      <circle cx="98" cy="88" r="17" fill="var(--color-accent)" />
      <path d="M98 97V80m-7 7 7-7 7 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ProcessArt() {
  return (
    <svg viewBox="0 0 140 120" className="h-28 w-auto" aria-hidden>
      <circle cx="70" cy="62" r="54" fill="var(--color-accent)" opacity=".08" />
      {doc}
      <g transform="translate(98 88)">
        <circle r="17" fill="var(--color-accent-dark)" />
        <path
          d="M0-9v3M0 6v3M-9 0h3M6 0h3M-6.4-6.4l2.1 2.1M4.3 4.3l2.1 2.1M-6.4 6.4l2.1-2.1M4.3-4.3l2.1-2.1"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle r="3.6" fill="none" stroke="#fff" strokeWidth="2.4" />
      </g>
      <path d="M24 34l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="var(--color-accent)" opacity=".6" />
      <path d="M118 22l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="var(--color-accent)" opacity=".45" />
    </svg>
  )
}

export function DownloadArt() {
  return (
    <svg viewBox="0 0 140 120" className="h-28 w-auto" aria-hidden>
      <circle cx="70" cy="62" r="54" fill="var(--color-accent)" opacity=".08" />
      {doc}
      <circle cx="98" cy="88" r="17" fill="#12B76A" />
      <path d="M98 79v15m-7-7 7 7 7-7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StepArrow() {
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-20 text-accent/60 rtl:-scale-x-100" aria-hidden>
      <path d="M2 12c20-10 50-10 70 0" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" />
      <path d="M64 5l9 7-10 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Squiggle() {
  return (
    <svg viewBox="0 0 200 16" preserveAspectRatio="none" className="squiggle absolute inset-x-0 -bottom-2 h-3 w-full" aria-hidden>
      <path d="M3 11c40-8 80-9 120-5s55 2 74-3" fill="none" stroke="var(--color-accent)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

function FloatingDoc({ label, tone }: { label: string; tone: 'red' | 'dark' | 'light' }) {
  const fill = tone === 'red' ? 'var(--color-accent)' : tone === 'dark' ? 'var(--color-accent-dark)' : 'var(--color-card)'
  const ink = tone === 'light' ? 'var(--color-accent)' : '#ffffff'
  return (
    <svg viewBox="0 0 80 100" className="size-full drop-shadow-[0_14px_24px_rgb(217_45_32/0.22)]" aria-hidden>
      <path d="M12 2h40l26 26v58a12 12 0 0 1-12 12H12A12 12 0 0 1 0 86V14A12 12 0 0 1 12 2Z" fill={fill} stroke={tone === 'light' ? 'var(--color-accent)' : 'none'} strokeOpacity=".35" strokeWidth="2" />
      <path d="M52 2v16a10 10 0 0 0 10 10h16" fill={tone === 'light' ? 'var(--color-blush)' : '#fff'} fillOpacity={tone === 'light' ? 1 : 0.28} />
      <rect x="14" y="44" width="40" height="5" rx="2.5" fill={ink} fillOpacity=".55" />
      <rect x="14" y="56" width="28" height="5" rx="2.5" fill={ink} fillOpacity=".4" />
      <text x="14" y="84" fontFamily="Plus Jakarta Sans, Inter, sans-serif" fontWeight="800" fontSize="15" fill={ink}>
        {label}
      </text>
    </svg>
  )
}

/** Decorative layer behind the hero: drifting glow and gently bobbing documents (wide screens only). */
export function HeroDecor() {
  const docs = [
    { label: 'PDF', tone: 'red', cls: 'start-[6%] top-24 w-20', r: '-10deg', d: '0ms', dur: '7s' },
    { label: 'JPG', tone: 'light', cls: 'start-[13%] top-[26rem] w-14', r: '8deg', d: '1.2s', dur: '8s' },
    { label: 'PDF', tone: 'light', cls: 'end-[7%] top-32 w-16', r: '9deg', d: '600ms', dur: '7.5s' },
    { label: 'ZIP', tone: 'dark', cls: 'end-[12%] top-[24rem] w-20', r: '-6deg', d: '1.8s', dur: '9s' },
  ] as const
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="animate-drift absolute start-1/2 -top-40 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(91_75_219/0.14),transparent)] rtl:translate-x-1/2" />
      <div className="animate-drift absolute -end-40 top-40 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgb(91_75_219/0.08),transparent)] [animation-delay:-9s]" />
      {docs.map((doc, i) => (
        <div
          key={i}
          className={`animate-fade-up absolute hidden xl:block ${doc.cls}`}
          style={{ '--d': `${500 + i * 150}ms` } as React.CSSProperties}
        >
          <div className="animate-bob" style={{ '--r': doc.r, '--d': doc.d, '--dur': doc.dur } as React.CSSProperties}>
            <FloatingDoc label={doc.label} tone={doc.tone} />
          </div>
        </div>
      ))}
    </div>
  )
}
