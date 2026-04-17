import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PATH_ADMIN_NEW, PATH_ADMIN_UPDATE, PATH_LOGIN } from '../data'
import { PRIMUS, DREAMS } from '../data/dreams'
import { getCookie, setCookie, getJsonCookie } from '../utils/cookies'
import { isAuthenticated } from '../utils/auth'
import { useTheme } from '../context/ThemeContext'
import { IcoSun, IcoMoon, IcoPlus, IcoPencil, IcoStar } from '../components/icons'

const COOKIE_PRIMUS  = 'blog_primus'
const COOKIE_DREAMS  = 'blog_dreams'
const COOKIE_SANCTUM = 'blog_sanctum'

const navBtn =
  'p-1.5 rounded-lg text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 hover:bg-[rgba(221,0,0,0.09)] dark:hover:bg-[#2d2855]/60 transition-colors'

const sectionCard =
  'rounded-2xl border border-stone-200 dark:border-[#322d5a] bg-[#faf6ee] dark:bg-[#1a1735] p-6 mb-8'

const sectionTitle =
  'text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] mb-5 flex items-center gap-2'

export default function AdminDreams() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    if (!isAuthenticated()) navigate(PATH_LOGIN || '/', { replace: true })
  }, [navigate])

  // ── Section 1: Primus Inter Pares ─────────────────────────────────────────
  const [primusChecked, setPrimusChecked] = useState<Set<number>>(
    () => new Set(getJsonCookie<number[]>(COOKIE_PRIMUS, [])),
  )

  function togglePrimus(i: number) {
    setPrimusChecked(prev => {
      const next = new Set(prev)
      if (next.has(i)) { next.delete(i) } else { next.add(i) }
      setCookie(COOKIE_PRIMUS, JSON.stringify([...next]))
      return next
    })
  }

  // ── Section 2: Dreams ─────────────────────────────────────────────────────
  const [dreamsChecked, setDreamsChecked] = useState<Set<number>>(
    () => new Set(getJsonCookie<number[]>(COOKIE_DREAMS, [])),
  )

  function toggleDream(i: number) {
    setDreamsChecked(prev => {
      const next = new Set(prev)
      if (next.has(i)) { next.delete(i) } else { next.add(i) }
      setCookie(COOKIE_DREAMS, JSON.stringify([...next]))
      return next
    })
  }

  // ── Section 3: Inner Sanctum ──────────────────────────────────────────────
  const [sanctum, setSanctum] = useState<string>(() => getCookie(COOKIE_SANCTUM) ?? '')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function startEdit() { setDraft(sanctum); setEditing(true) }
  function cancelEdit() { setEditing(false) }
  function saveSanctum() {
    setSanctum(draft)
    setCookie(COOKIE_SANCTUM, draft)
    setEditing(false)
  }

  if (!isAuthenticated()) return null

  return (
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300 flex flex-col">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <div className="flex justify-end items-center gap-3 p-4">
        <Link to={PATH_ADMIN_UPDATE} className={navBtn} aria-label="Edit post" title="Edit post">
          <IcoPencil />
        </Link>
        <Link to={PATH_ADMIN_NEW} className={navBtn} aria-label="New post" title="New post">
          <IcoPlus />
        </Link>
        <button onClick={toggle} className={navBtn} aria-label="Toggle theme">
          {theme === 'dark' ? <IcoSun /> : <IcoMoon />}
        </button>
      </div>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-20">

        <div className="mb-10 text-center">
          <h1
            className="text-5xl text-[#395144] dark:text-[#f0ecfd] leading-none"
            style={{ fontFamily: 'Caveat' }}
          >
            Inner World
          </h1>
        </div>

        {/* ── Section 1: Primus Inter Pares ───────────────────────────────── */}
        <div className={sectionCard}>
          <h2 className={sectionTitle}>
            <span className="text-amber-500 dark:text-amber-400">✦</span>
            Primus Inter Pares
          </h2>
          {PRIMUS.length === 0 ? (
            <p className="text-stone-400 dark:text-[#5a5180] text-sm italic">
              No entries yet — add yours to <code className="text-xs">src/data/dreams.ts</code>.
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {PRIMUS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <button
                      onClick={() => togglePrimus(i)}
                      className={`mt-0.5 shrink-0 transition-colors ${
                        primusChecked.has(i)
                          ? 'text-amber-500 dark:text-amber-400'
                          : 'text-stone-300 dark:text-[#3a3462] hover:text-amber-400'
                      }`}
                      aria-label={primusChecked.has(i) ? 'Mark as not done' : 'Mark as done'}
                    >
                      <IcoStar />
                    </button>
                    <span
                      className={`text-sm leading-relaxed transition-colors ${
                        primusChecked.has(i)
                          ? 'text-stone-800 dark:text-[#d4cef5]'
                          : 'text-stone-500 dark:text-[#8b7db8]'
                      }`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-stone-400 dark:text-[#5a5180]">
                {primusChecked.size} / {PRIMUS.length} achieved
              </p>
            </>
          )}
        </div>

        {/* ── Section 2: Dreams ───────────────────────────────────────────── */}
        <div className={sectionCard}>
          <h2 className={sectionTitle}>
            <span className="text-[#dd0000] dark:text-amber-400">◇</span>
            Dreams
          </h2>
          {DREAMS.length === 0 ? (
            <p className="text-stone-400 dark:text-[#5a5180] text-sm italic">
              No dreams listed yet — add yours to <code className="text-xs">src/data/dreams.ts</code>.
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {DREAMS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <button
                      onClick={() => toggleDream(i)}
                      className={`mt-0.5 shrink-0 transition-colors ${
                        dreamsChecked.has(i)
                          ? 'text-amber-500 dark:text-amber-400'
                          : 'text-stone-300 dark:text-[#3a3462] hover:text-amber-400'
                      }`}
                      aria-label={dreamsChecked.has(i) ? 'Mark as not done' : 'Mark as done'}
                    >
                      <IcoStar />
                    </button>
                    <span
                      className={`text-sm leading-relaxed transition-colors ${
                        dreamsChecked.has(i)
                          ? 'line-through text-stone-400 dark:text-[#5a5180]'
                          : 'text-stone-800 dark:text-[#d4cef5]'
                      }`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-stone-400 dark:text-[#5a5180]">
                {dreamsChecked.size} / {DREAMS.length} achieved
              </p>
            </>
          )}
        </div>

        {/* ── Section 3: Inner Sanctum ────────────────────────────────────── */}
        <div className={sectionCard}>
          <h2 className={`${sectionTitle} justify-between`}>
            <span className="flex items-center gap-2">
              <span className="text-[#395144] dark:text-amber-400">◈</span>
              Inner Sanctum
            </span>
            {!editing && (
              <button
                onClick={startEdit}
                className="p-1 rounded-md text-stone-400 dark:text-[#5a5180] hover:text-[#dd0000] dark:hover:text-amber-400 transition-colors"
                aria-label="Edit inner sanctum"
                title="Edit"
              >
                <IcoPencil />
              </button>
            )}
          </h2>

          {editing ? (
            <div className="space-y-3">
              <textarea
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={14}
                placeholder="Write freely — markdown supported."
                className="w-full px-3 py-2 rounded-lg bg-[#efead8] dark:bg-[#0f0d24] border border-stone-300 dark:border-[#322d5a] text-stone-900 dark:text-[#f0ecfd] placeholder:text-stone-400 dark:placeholder:text-[#8b7db8] focus:outline-none focus:border-[#dd0000] dark:focus:border-amber-400 transition-colors text-sm leading-relaxed resize-none font-sans"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-1.5 rounded-lg text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSanctum}
                  className="px-5 py-1.5 rounded-lg text-xs uppercase tracking-widest bg-[#395144] dark:bg-amber-400 text-white dark:text-[#0f0d24] hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </div>
          ) : sanctum.trim() ? (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-stone dark:prose-p:text-[#d4cef5] dark:prose-headings:text-[#f0ecfd] dark:prose-strong:text-[#f0ecfd] dark:prose-li:text-[#d4cef5]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {sanctum}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-stone-400 dark:text-[#5a5180] text-sm italic">
              Terra incognita.
            </p>
          )}
        </div>

      </main>
    </div>
  )
}
