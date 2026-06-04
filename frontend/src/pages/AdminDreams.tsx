import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PATH_ADMIN_NEW, PATH_ADMIN_UPDATE, PATH_ADMIN_INFO, PATH_LOGIN } from '../data'
import { getCookie, setCookie, getJsonCookie } from '../utils/cookies'
import { isAuthenticated } from '../utils/auth'
import { useTheme } from '../context/ThemeContext'
import { IcoSun, IcoMoon, IcoPlus, IcoPencil, IcoStar, IcoChart } from '../components/icons'

const COOKIE_PRIMUS  = 'blog_primus'
const COOKIE_DREAMS  = 'blog_dreams'
const COOKIE_SANCTUM = 'blog_sanctum'

type ListItem = { text: string; checked: boolean }

function parseItems(raw: unknown[]): ListItem[] {
  return raw.filter(
    (item): item is ListItem =>
      item !== null && typeof item === 'object' && typeof (item as ListItem).text === 'string',
  )
}

const navBtn =
  'p-1.5 rounded-lg text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 hover:bg-[rgba(221,0,0,0.09)] dark:hover:bg-[#2d2855]/60 transition-colors'

const sectionCard =
  'rounded-2xl border border-stone-200 dark:border-[#322d5a] bg-[#faf6ee] dark:bg-[#1a1735] p-6 mb-8'

const sectionTitle =
  'text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] mb-5 flex items-center justify-between'

const editBtn =
  'p-1 rounded-md text-stone-400 dark:text-[#5a5180] hover:text-[#dd0000] dark:hover:text-amber-400 transition-colors'

const textarea =
  'w-full px-3 py-2 rounded-lg bg-[#efead8] dark:bg-[#0f0d24] border border-stone-300 dark:border-[#322d5a] text-stone-900 dark:text-[#f0ecfd] placeholder:text-stone-400 dark:placeholder:text-[#8b7db8] focus:outline-none focus:border-[#dd0000] dark:focus:border-amber-400 transition-colors text-sm leading-relaxed resize-none font-sans'

export default function AdminDreams() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    if (!isAuthenticated()) navigate(PATH_LOGIN || '/', { replace: true })
  }, [navigate])

  // ── Primus Inter Pares ────────────────────────────────────────────────────
  const [primus, setPrimus] = useState<ListItem[]>(() =>
    parseItems(getJsonCookie<unknown[]>(COOKIE_PRIMUS, [])),
  )
  const [editingPrimus, setEditingPrimus] = useState(false)
  const [primusDraft, setPrimusDraft] = useState('')

  function togglePrimus(i: number) {
    const next = primus.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item)
    setPrimus(next)
    setCookie(COOKIE_PRIMUS, JSON.stringify(next))
  }
  function startEditPrimus() {
    setPrimusDraft(primus.map(item => item.text).join('\n'))
    setEditingPrimus(true)
  }
  function savePrimus() {
    const existing = new Map(primus.map(item => [item.text, item.checked]))
    const next: ListItem[] = primusDraft
      .split('\n').map(l => l.trim()).filter(Boolean)
      .map(text => ({ text, checked: existing.get(text) ?? false }))
    setPrimus(next)
    setCookie(COOKIE_PRIMUS, JSON.stringify(next))
    setEditingPrimus(false)
  }

  // ── Dreams ────────────────────────────────────────────────────────────────
  const [dreams, setDreams] = useState<ListItem[]>(() =>
    parseItems(getJsonCookie<unknown[]>(COOKIE_DREAMS, [])),
  )
  const [editingDreams, setEditingDreams] = useState(false)
  const [dreamsDraft, setDreamsDraft] = useState('')

  function toggleDream(i: number) {
    const next = dreams.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item)
    setDreams(next)
    setCookie(COOKIE_DREAMS, JSON.stringify(next))
  }
  function startEditDreams() {
    setDreamsDraft(dreams.map(item => item.text).join('\n'))
    setEditingDreams(true)
  }
  function saveDreams() {
    const existing = new Map(dreams.map(item => [item.text, item.checked]))
    const next: ListItem[] = dreamsDraft
      .split('\n').map(l => l.trim()).filter(Boolean)
      .map(text => ({ text, checked: existing.get(text) ?? false }))
    setDreams(next)
    setCookie(COOKIE_DREAMS, JSON.stringify(next))
    setEditingDreams(false)
  }

  // ── Inner Sanctum ─────────────────────────────────────────────────────────
  const [sanctum, setSanctum] = useState<string>(() => getCookie(COOKIE_SANCTUM) ?? '')
  const [editingSanctum, setEditingSanctum] = useState(false)
  const [sanctumDraft, setSanctumDraft] = useState('')

  function saveSanctum() {
    setSanctum(sanctumDraft)
    setCookie(COOKIE_SANCTUM, sanctumDraft)
    setEditingSanctum(false)
  }

  if (!isAuthenticated()) return null

  return (
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300 flex flex-col">

      <div className="flex justify-end items-center gap-3 p-4">
        <Link to={PATH_ADMIN_INFO} className={navBtn} aria-label="Analytics" title="Analytics">
          <IcoChart />
        </Link>
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

        {/* ── Primus Inter Pares ───────────────────────────────────────────── */}
        <div className={sectionCard}>
          <h2 className={sectionTitle}>
            <span className="flex items-center gap-2">
              <span className="text-amber-500 dark:text-amber-400">✦</span>
              Primus Inter Pares
            </span>
            {!editingPrimus && (
              <button onClick={startEditPrimus} className={editBtn} aria-label="Edit list" title="Edit">
                <IcoPencil />
              </button>
            )}
          </h2>

          {editingPrimus ? (
            <div className="space-y-3">
              <p className="text-xs text-stone-400 dark:text-[#5a5180]">One item per line.</p>
              <textarea
                autoFocus
                value={primusDraft}
                onChange={e => setPrimusDraft(e.target.value)}
                rows={8}
                placeholder="Each line becomes one achievement."
                className={textarea}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingPrimus(false)}
                  className="px-4 py-1.5 rounded-lg text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={savePrimus}
                  className="px-5 py-1.5 rounded-lg text-xs uppercase tracking-widest bg-[#395144] dark:bg-amber-400 text-white dark:text-[#0f0d24] hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </div>
          ) : primus.length === 0 ? (
            <p className="text-stone-400 dark:text-[#5a5180] text-sm italic">
              No entries yet — click the pencil to add yours.
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {primus.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <button
                      onClick={() => togglePrimus(i)}
                      className={`mt-0.5 shrink-0 transition-colors ${
                        item.checked
                          ? 'text-amber-500 dark:text-amber-400'
                          : 'text-stone-300 dark:text-[#3a3462] hover:text-amber-400'
                      }`}
                      aria-label={item.checked ? 'Mark as not done' : 'Mark as done'}
                    >
                      <IcoStar />
                    </button>
                    <span className={`text-sm leading-relaxed transition-colors ${
                      item.checked
                        ? 'text-stone-800 dark:text-[#d4cef5]'
                        : 'text-stone-500 dark:text-[#8b7db8]'
                    }`}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-stone-400 dark:text-[#5a5180]">
                {primus.filter(i => i.checked).length} / {primus.length} achieved
              </p>
            </>
          )}
        </div>

        {/* ── Dreams ──────────────────────────────────────────────────────── */}
        <div className={sectionCard}>
          <h2 className={sectionTitle}>
            <span className="flex items-center gap-2">
              <span className="text-[#dd0000] dark:text-amber-400">◇</span>
              Dreams
            </span>
            {!editingDreams && (
              <button onClick={startEditDreams} className={editBtn} aria-label="Edit list" title="Edit">
                <IcoPencil />
              </button>
            )}
          </h2>

          {editingDreams ? (
            <div className="space-y-3">
              <p className="text-xs text-stone-400 dark:text-[#5a5180]">One item per line.</p>
              <textarea
                autoFocus
                value={dreamsDraft}
                onChange={e => setDreamsDraft(e.target.value)}
                rows={8}
                placeholder="Each line becomes one dream."
                className={textarea}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingDreams(false)}
                  className="px-4 py-1.5 rounded-lg text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDreams}
                  className="px-5 py-1.5 rounded-lg text-xs uppercase tracking-widest bg-[#395144] dark:bg-amber-400 text-white dark:text-[#0f0d24] hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </div>
          ) : dreams.length === 0 ? (
            <p className="text-stone-400 dark:text-[#5a5180] text-sm italic">
              No dreams listed yet — click the pencil to add yours.
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {dreams.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <button
                      onClick={() => toggleDream(i)}
                      className={`mt-0.5 shrink-0 transition-colors ${
                        item.checked
                          ? 'text-amber-500 dark:text-amber-400'
                          : 'text-stone-300 dark:text-[#3a3462] hover:text-amber-400'
                      }`}
                      aria-label={item.checked ? 'Mark as not done' : 'Mark as done'}
                    >
                      <IcoStar />
                    </button>
                    <span className={`text-sm leading-relaxed transition-colors ${
                      item.checked
                        ? 'line-through text-stone-400 dark:text-[#5a5180]'
                        : 'text-stone-800 dark:text-[#d4cef5]'
                    }`}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-stone-400 dark:text-[#5a5180]">
                {dreams.filter(i => i.checked).length} / {dreams.length} achieved
              </p>
            </>
          )}
        </div>

        {/* ── Inner Sanctum ───────────────────────────────────────────────── */}
        <div className={sectionCard}>
          <h2 className={sectionTitle}>
            <span className="flex items-center gap-2">
              <span className="text-[#395144] dark:text-amber-400">◈</span>
              Inner Sanctum
            </span>
            {!editingSanctum && (
              <button
                onClick={() => { setSanctumDraft(sanctum); setEditingSanctum(true) }}
                className={editBtn}
                aria-label="Edit inner sanctum"
                title="Edit"
              >
                <IcoPencil />
              </button>
            )}
          </h2>

          {editingSanctum ? (
            <div className="space-y-3">
              <textarea
                autoFocus
                value={sanctumDraft}
                onChange={e => setSanctumDraft(e.target.value)}
                rows={14}
                placeholder="Write freely — markdown supported."
                className={textarea}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingSanctum(false)}
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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{sanctum}</ReactMarkdown>
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
