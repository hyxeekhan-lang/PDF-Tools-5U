export const COOKIE_CONSENT_KEY = 'pdfpilot5u-cookie-consent-v2'
export const OPEN_COOKIE_SETTINGS_EVENT = 'pdfpilot5u:open-cookie-settings'

export type CookieConsent = 'all' | 'essential'

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
}
