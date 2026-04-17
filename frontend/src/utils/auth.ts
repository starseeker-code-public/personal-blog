/**
 * Tiny session-only auth helper for the admin /login flow.
 *
 * Stores the HTTP Basic Auth header value in sessionStorage so it survives
 * page reloads but is wiped when the tab closes. Single-user model — no
 * tokens, no expiry, no refresh logic.
 */

const STORAGE_KEY = 'blog-admin-auth'

export function setAuth(username: string, password: string): void {
  const header = `Basic ${btoa(`${username}:${password}`)}`
  sessionStorage.setItem(STORAGE_KEY, header)
}

export function getAuth(): string | null {
  return sessionStorage.getItem(STORAGE_KEY)
}

export function clearAuth(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function isAuthenticated(): boolean {
  return getAuth() !== null
}
