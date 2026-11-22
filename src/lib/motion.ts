import { useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Reveals every `[data-reveal]` element as it scrolls into view, including ones added after navigation. */
export function useScrollReveal() {
  useEffect(() => {
    const root = document.documentElement
    if (reducedMotion() || !('IntersectionObserver' in window)) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )

    const track = (el: Element) => {
      if (!el.classList.contains('is-visible')) io.observe(el)
    }

    // Anything already on screen at first paint stays visible, so the page never flickers.
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible')
      else track(el)
    })
    root.classList.add('reveal-on')

    const mo = new MutationObserver((records) => {
      for (const rec of records)
        rec.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return
          if (node.matches('[data-reveal]')) track(node)
          node.querySelectorAll('[data-reveal]').forEach(track)
        })
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
      root.classList.remove('reveal-on')
    }
  }, [])
}

/** Fades the page content in on route changes without remounting it. */
export function usePageTransition<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!ref.current || reducedMotion()) return
    ref.current.animate(
      [
        { opacity: 0, transform: 'translate3d(0, 10px, 0)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 320, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
    )
  }, [pathname])

  return ref
}
