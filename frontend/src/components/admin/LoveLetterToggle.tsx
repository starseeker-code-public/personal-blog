import type { ContentStatus } from '../../i18n'

interface LoveLetterToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Status of the Spanish version: the letter is in Spanish once it's complete. */
  spanish: ContentStatus
  draft: boolean
  sentAt?: string
}

/**
 * Opt-in for the love-letter email, for posts tagged `love`. The backend
 * sends it in Spanish (English while there's no Spanish version) once the
 * post is published.
 */
export function LoveLetterToggle({ checked, onChange, spanish, draft, sentAt }: LoveLetterToggleProps) {
  const notes = [
    spanish === 'complete' ? 'in Spanish' : 'in English, as there\'s no Spanish version yet',
    draft && 'sent when the draft is published',
    sentAt && `last sent ${new Date(sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
  ].filter(Boolean)

  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <input
        type="checkbox" checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#dd0000] dark:accent-amber-400"
      />
      <span className="text-sm text-stone-700 dark:text-[#c9beed]">
        send email to loved one
        <span className="text-xs text-stone-500 dark:text-[#8b7db8]"> · {notes.join(' · ')}</span>
      </span>
    </label>
  )
}
