export function LogoMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M9 2.5h11.5L29 11v17.5a2 2 0 0 1-2 2H9a6 6 0 0 1-6-6v-16a6 6 0 0 1 6-6Z" fill="#D92D20" />
      <path d="M20.5 2.5V8a3 3 0 0 0 3 3H29L20.5 2.5Z" fill="#FBBF24" />
      <rect x="9" y="13.5" width="14" height="2.4" rx="1.2" fill="#fff" />
      <rect x="9" y="18.2" width="10" height="2.4" rx="1.2" fill="#fff" fillOpacity=".85" />
      <rect x="9" y="22.9" width="12" height="2.4" rx="1.2" fill="#fff" fillOpacity=".7" />
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span dir="ltr" className={`inline-flex items-center ${className}`}>
      <img src="/brand/logo.svg" alt="PDF Pilot 5U" className="h-8 w-[150px] dark:hidden" width="150" height="32" />
      <img src="/brand/logo-dark.svg" alt="PDF Pilot 5U" className="hidden h-8 w-[150px] dark:block" width="150" height="32" />
    </span>
  )
}
