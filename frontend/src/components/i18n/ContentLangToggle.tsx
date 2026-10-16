import { MESSAGES, SUPPORTED_LANGS, contentStatus, type ContentStatus, type Lang, type PostContent } from '../../i18n'

/** The composer's label for each language. */
export const CONTENT_LANG_LABELS: Record<Lang, string> = {
  en: 'ENG',
  es: 'ESP',
}

const STATUS_TEXT: Record<ContentStatus, string> = {
  empty: 'not written yet',
  partial: 'in progress (needs a title and a body)',
  complete: 'title and body written',
}

// Hollow = not started, half = in progress, solid = ready to publish.
const STATUS_DOT: Record<ContentStatus, string> = {
  empty: 'opacity-50',
  partial: 'bg-[linear-gradient(90deg,currentColor_50%,transparent_50%)]',
  complete: 'bg-current',
}

// The admin pages are in English.
const statusTitle = (lang: Lang, status: ContentStatus) => `${MESSAGES.en.languages[lang]}: ${STATUS_TEXT[status]}`

interface ContentLangToggleProps {
  value: Lang
  onChange: (lang: Lang) => void
  status: Record<Lang, ContentStatus>
}

/**
 * ENG / ESP switch for the post composer. Title, excerpt and body are kept
 * per language as you type, so switching never loses text.
 */
export function ContentLangToggle({ value, onChange, status }: ContentLangToggleProps) {
  return (
    <div
      role="group"
      aria-label="Post language"
      className="inline-flex items-center rounded-lg border border-stone-300 dark:border-[#322d5a] bg-[#efead8] dark:bg-[#0f0d24] p-0.5 text-xs font-medium tracking-widest"
    >
      {SUPPORTED_LANGS.map(l => {
        const active = l === value
        return (
          <button
            key={l}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(l)}
            title={statusTitle(l, status[l])}
            className={
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ' +
              (active
                ? 'bg-[#798777] dark:bg-amber-500 text-white dark:text-stone-900'
                : 'text-stone-600 dark:text-[#c9beed] hover:text-[#dd0000] dark:hover:text-amber-400')
            }
          >
            {CONTENT_LANG_LABELS[l]}
            <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full border border-current ${STATUS_DOT[status[l]]}`} />
          </button>
        )
      })}
    </div>
  )
}

/** ENG / ESP chips for post lists: solid when that version is ready, faded when it isn't. */
export function ContentLangBadges({ content }: { content: Record<Lang, PostContent> }) {
  return (
    <span className="inline-flex shrink-0 gap-1">
      {SUPPORTED_LANGS.map(l => {
        const status = contentStatus(content[l])
        return (
          <span
            key={l}
            title={statusTitle(l, status)}
            className={
              'px-1 rounded border text-[10px] tracking-widest ' +
              (status === 'complete'
                ? 'border-[#798777] text-[#798777] dark:border-amber-400 dark:text-amber-400'
                : 'border-stone-300 text-stone-400 dark:border-[#322d5a] dark:text-[#5f5690]')
            }
          >
            {CONTENT_LANG_LABELS[l]}
          </span>
        )
      })}
    </span>
  )
}
