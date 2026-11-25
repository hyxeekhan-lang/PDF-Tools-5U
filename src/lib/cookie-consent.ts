// Bump the preference version so returning visitors see the updated advertising choice again.
export const COOKIE_CONSENT_KEY = 'pdfpilot5u-cookie-consent-v3'
export const OPEN_COOKIE_SETTINGS_EVENT = 'pdfpilot5u:open-cookie-settings'

export type CookieConsent = 'all' | 'essential'

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
}
