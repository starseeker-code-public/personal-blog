// Only used to move the admin pages' old cookies into localStorage (see browserStore.ts).

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function cookieNames(): string[] {
  return document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(Boolean)
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`
}
