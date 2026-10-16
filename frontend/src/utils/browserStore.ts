import { cookieNames, deleteCookie, getCookie } from './cookies'

/**
 * The admin pages' private lists and notes (Inner World, yearly goals), kept
 * in this browser's localStorage. Nothing here is sent with requests, and
 * there's room for millions of characters. Like cookies, it lives only in this
 * browser on this device, and clearing the site's data erases it.
 */

// Earlier versions kept these in cookies, which ride along with every request
// and make the server reject them all once they add up to ~8 KB. Any still
// around move here on first use.
const LEGACY_COOKIE = /^blog_(primus|dreams|sanctum|goals_\d{4})$/
let migrated = false

function migrateCookies() {
  if (migrated) return
  migrated = true
  for (const name of cookieNames()) {
    if (!LEGACY_COOKIE.test(name)) continue
    const value = getCookie(name)
    try {
      if (value !== null && localStorage.getItem(name) === null) localStorage.setItem(name, value)
      deleteCookie(name)
    } catch {
      // Storage unavailable: leave the cookie where it is.
    }
  }
}

export function readText(key: string): string | null {
  migrateCookies()
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readText(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Saves `value`, or says so when the browser refuses (storage full or disabled). */
export function store(key: string, value: string): boolean {
  migrateCookies()
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    window.alert("Couldn't save: this browser refused to store it (its storage is full or disabled).")
    return false
  }
}

/** Every stored key matching `pattern`. */
export function storedKeys(pattern: RegExp): string[] {
  migrateCookies()
  try {
    return Object.keys(localStorage).filter(key => pattern.test(key))
  } catch {
    return []
  }
}
