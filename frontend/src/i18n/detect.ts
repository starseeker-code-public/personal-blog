import { DEFAULT_LANG, isLang, type Lang } from './config'

const STORAGE_KEY = 'lang'

/** The first supported language in the browser's preference list, or English. */
export function browserLang(): Lang {
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const pref of prefs) {
    const code = pref?.slice(0, 2).toLowerCase()
    if (isLang(code)) return code
  }
  return DEFAULT_LANG
}

/** The language the reader chose with the switch or the dialog, if any. */
export function savedLang(): Lang | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return isLang(value) ? value : null
  } catch {
    return null
  }
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Private mode or storage disabled: the choice just isn't remembered.
  }
}

/** The language to use when the URL doesn't say: the reader's choice, else their browser's. */
export function preferredLang(): Lang {
  return savedLang() ?? browserLang()
}
