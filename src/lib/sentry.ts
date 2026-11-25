import * as Sentry from '@sentry/tanstackstart-react'

const dsn = import.meta.env.VITE_SENTRY_DSN

if (typeof window !== 'undefined' && dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  })
}

export { Sentry }
