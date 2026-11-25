import { Link, useLocation } from '@tanstack/react-router'
import { BookOpen, CircleUser, Home, LayoutGrid, Search } from 'lucide-react'

type NavTab = 'home' | 'tools' | 'search' | 'blog' | 'account'

const navItems: Array<{ id: NavTab; label: string; icon: typeof Home; to: '/' | '/tools' | '/blog' | '/dashboard'; hash?: string }> = [
  { id: 'home', label: 'Home', icon: Home, to: '/' },
  { id: 'tools', label: 'Tools', icon: LayoutGrid, to: '/tools' },
  { id: 'search', label: 'Search', icon: Search, to: '/tools', hash: 'search' },
  { id: 'blog', label: 'Blog', icon: BookOpen, to: '/blog' },
  { id: 'account', label: 'Account', icon: CircleUser, to: '/dashboard' },
]

function activeTab(pathname: string, hash?: string): NavTab {
  if (hash === 'search') return pathname === '/tools' ? 'search' : 'tools'
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/blog')) return 'blog'
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/account') || pathname.startsWith('/login')) return 'account'
  return 'tools'
}

export function BottomNavbar() {
  const location = useLocation()
  const current = activeTab(location.pathname, location.hash === 'search' ? 'search' : undefined)

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-paper/95 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.04)] backdrop-blur-md xl:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map(({ id, label, icon: Icon, to, hash }) => {
          const isActive = current === id
          return (
            <li key={id} className="flex-1">
              <Link
                to={to}
                hash={hash}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-h-12 w-full flex-col items-center justify-center rounded-xl py-1 text-xs transition active:scale-95 ${isActive ? 'font-semibold text-accent' : 'font-medium text-muted hover:text-ink'}`}
              >
                <Icon aria-hidden className={`size-[22px] transition-transform ${isActive ? 'scale-105 stroke-[2.2px]' : 'stroke-[1.8px]'}`} />
                <span className="mt-1 leading-none tracking-tight">{label}</span>
                <span aria-hidden className={`mt-1.5 h-0.5 w-6 rounded-full transition-opacity ${isActive ? 'bg-accent opacity-100' : 'bg-transparent opacity-0'}`} />
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

