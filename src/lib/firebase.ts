import type { Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

let analyticsApi: typeof import('firebase/analytics') | null = null
let analyticsInstance: Analytics | null = null
let analyticsPromise: Promise<Analytics | null> | null = null
let consentRevision = 0

function isConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId && firebaseConfig.measurementId)
}

function hasConfiguration() {
  return Object.values(firebaseConfig).some(Boolean)
}

async function initializeAnalytics() {
  if (!hasConfiguration()) return null

  if (!isConfigured()) {
    throw new Error('Firebase Analytics is not configured. Set the VITE_FIREBASE_* variables.')
  }

  const [appApi, analytics] = await Promise.all([import('firebase/app'), import('firebase/analytics')])
  analyticsApi = analytics
  if (!(await analytics.isSupported())) return null

  const app = appApi.getApps().find((candidate) => candidate.name === '[DEFAULT]') ?? appApi.initializeApp(firebaseConfig)
  return analytics.getAnalytics(app)
}

export async function setFirebaseAnalyticsConsent(allowed: boolean) {
  const revision = ++consentRevision

  if (!allowed) {
    if (analyticsInstance && analyticsApi) {
      analyticsApi.setAnalyticsCollectionEnabled(analyticsInstance, false)
    }
    return
  }

  if (!analyticsPromise) {
    analyticsPromise = initializeAnalytics().catch((cause) => {
      analyticsPromise = null
      throw cause
    })
  }

  const instance = await analyticsPromise
  analyticsInstance = instance

  if (revision !== consentRevision) {
    if (instance && analyticsApi) analyticsApi.setAnalyticsCollectionEnabled(instance, false)
    return
  }

  if (instance && analyticsApi) analyticsApi.setAnalyticsCollectionEnabled(instance, true)
}
