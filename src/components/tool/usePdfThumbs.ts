import { useEffect, useState } from 'react'
import { type Bilingual, ToolError, openPdfjs, renderPage } from '#/lib/pdf'

export type Thumbs = {
  count: number
  thumbs: (string | null)[]
  error: Bilingual | null
  loading: boolean
}

/** Renders small JPEG previews of every page, one at a time, so the grid fills in progressively. */
export function usePdfThumbs(file: File | undefined, width = 180): Thumbs {
  const [state, setState] = useState<Thumbs>({ count: 0, thumbs: [], error: null, loading: false })

  useEffect(() => {
    if (!file) return
    let cancelled = false
    setState({ count: 0, thumbs: [], error: null, loading: true })
    ;(async () => {
      try {
        const pdf = await openPdfjs(file)
        if (cancelled) return pdf.destroy()
        const count = pdf.numPages
        setState({ count, thumbs: Array(count).fill(null), error: null, loading: true })
        for (let i = 1; i <= count && !cancelled; i++) {
          const page = await pdf.getPage(i)
          const base = page.getViewport({ scale: 1 })
          const { canvas } = await renderPage(page, (width * 2) / base.width)
          const url = canvas.toDataURL('image/jpeg', 0.7)
          canvas.width = 0
          page.cleanup()
          if (cancelled) break
          setState((s) => {
            const thumbs = [...s.thumbs]
            thumbs[i - 1] = url
            return { ...s, thumbs }
          })
        }
        await pdf.destroy()
        if (!cancelled) setState((s) => ({ ...s, loading: false }))
      } catch (e) {
        if (cancelled) return
        const error = e instanceof ToolError ? e.text : { en: 'Couldn’t preview this PDF.', ur: 'اس پی ڈی ایف کا پیش منظر نہیں بن سکا۔' }
        setState({ count: 0, thumbs: [], error, loading: false })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [file, width])

  return state
}
