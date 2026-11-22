import '@tanstack/react-router'

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    funnel?: { next: string[] }
    funnelButtons?: Record<string, string>
    pageId?: string
  }
}
