export function LogoMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="4" y="2" width="24" height="28" rx="6" fill="#F04438" />
      <path d="M20 2h2a6 6 0 0 1 6 6v2h-5a3 3 0 0 1-3-3V2Z" fill="#D92D20" />
      <path d="M20 2v5a3 3 0 0 0 3 3h5" fill="none" stroke="#FFF1F0" strokeOpacity=".55" strokeWidth="1.2" />
      <rect x="9" y="14" width="14" height="2.4" rx="1.2" fill="#fff" />
      <rect x="9" y="19" width="10" height="2.4" rx="1.2" fill="#fff" fillOpacity=".85" />
      <rect x="9" y="24" width="12" height="2.4" rx="1.2" fill="#fff" fillOpacity=".7" />
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span dir="ltr" className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className="font-display text-xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        <span className="text-ink">PDF</span>
        <span className="text-accent">Tools</span>
      </span>
    </span>
  )
}
