export const COOKIE_CONSENT_KEY = 'pdfora-cookie-consent-v2'
export const OPEN_COOKIE_SETTINGS_EVENT = 'pdfora:open-cookie-settings'

export type CookieConsent = 'all' | 'essential'

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
}
