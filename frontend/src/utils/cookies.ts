export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function setCookie(name: string, value: string, days = 18250) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

export function getJsonCookie<T>(name: string, fallback: T): T {
  const raw = getCookie(name)
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}
