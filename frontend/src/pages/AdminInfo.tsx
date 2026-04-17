import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, PATH_ADMIN_NEW, PATH_ADMIN_UPDATE, PATH_ADMIN_DREAMS, PATH_LOGIN } from '../data'
import { getJsonCookie } from '../utils/cookies'
import { isAuthenticated } from '../utils/auth'
import { useTheme } from '../context/ThemeContext'
import { IcoSun, IcoMoon, IcoPlus, IcoPencil, IcoDreams } from '../components/icons'
import type { Post } from '../types'

const currentYear = new Date().getFullYear()
const COOKIE_GOALS = `blog_goals_${currentYear}`

const navBtn =
  'p-1.5 rounded-lg text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 hover:bg-[rgba(221,0,0,0.09)] dark:hover:bg-[#2d2855]/60 transition-colors'

const sectionCard =
  'rounded-2xl border border-stone-200 dark:border-[#322d5a] bg-[#faf6ee] dark:bg-[#1a1735] p-6 mb-8'

const sectionTitle =
  'text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] mb-5 flex items-center gap-2'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function isWithinDays(dateStr: string, days: number): boolean {
  return daysSince(dateStr) <= days
}

export default function AdminInfo() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    if (!isAuthenticated()) navigate(PATH_LOGIN || '/', { replace: true })
  }, [navigate])

  // ── Goals ─────────────────────────────────────────────────────────────────
  // Stored as a JSON array in the `blog_goals_<year>` cookie. Edit it by hand
  // via devtools → Application → Cookies, e.g. ["Run a marathon","Ship v1"].
  const goals = getJsonCookie<string[]>(COOKIE_GOALS, [])

  // ── Analytics ─────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) return
    api.listAllPosts()
      .then(setPosts)
      .catch(e => setFetchError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    if (!posts.length) return null

    const published = posts.filter(p => !p.draft)
    const drafts = posts.filter(p => p.draft)

    // Posts per year
    const byYear: Record<number, number> = {}
    for (const p of posts) {
      const y = new Date(p.publishedAt).getFullYear()
      byYear[y] = (byYear[y] ?? 0) + 1
    }
    const years = Object.keys(byYear).map(Number).sort()
    const maxByYear = Math.max(...Object.values(byYear))

    // Recency (published only)
    const thisWeek  = published.filter(p => isWithinDays(p.publishedAt, 7)).length
    const thisMonth = published.filter(p => isWithinDays(p.publishedAt, 30)).length
    const thisYear  = published.filter(p => new Date(p.publishedAt).getFullYear() === currentYear).length

    // Days since last post
    const sorted = [...published].sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    const daysSinceLast = sorted[0] ? daysSince(sorted[0].publishedAt) : null

    // Categories
    const catCounts: Record<string, number> = {}
    for (const p of published) {
      const c = p.category || 'Uncategorised'
      catCounts[c] = (catCounts[c] ?? 0) + 1
    }

    type Recency = 'week' | 'month' | 'year' | null
    const catRecency: Record<string, Recency> = {}
    for (const cat of Object.keys(catCounts)) {
      const dates = published
        .filter(p => (p.category || 'Uncategorised') === cat)
        .map(p => p.publishedAt)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      const latest = dates[0]
      if (!latest) { catRecency[cat] = null; continue }
      if (isWithinDays(latest, 7)) catRecency[cat] = 'week'
      else if (isWithinDays(latest, 30)) catRecency[cat] = 'month'
      else if (new Date(latest).getFullYear() === currentYear) catRecency[cat] = 'year'
      else catRecency[cat] = null
    }

    // Tags
    const tagCounts: Record<string, number> = {}
    let totalTagCount = 0
    for (const p of published) {
      for (const t of p.tags ?? []) {
        tagCounts[t] = (tagCounts[t] ?? 0) + 1
        totalTagCount++
      }
    }
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])
    const top4    = sortedTags.slice(0, 4)
    const bottom4 = [...sortedTags].reverse().slice(0, 4)
    const uniqueTags     = sortedTags.length
    const avgTagsPerPost = published.length ? (totalTagCount / published.length).toFixed(1) : '0'

    // Words & read time
    const totalWords  = posts.reduce((sum, p) => sum + countWords(p.body ?? ''), 0)
    const avgReadTime = published.length ? Math.round(totalWords / published.length / 200) : 0

    // Most prolific month
    const byMonth: Record<string, number> = {}
    for (const p of published) {
      const key = new Date(p.publishedAt).toLocaleString('default', { year: 'numeric', month: 'long' })
      byMonth[key] = (byMonth[key] ?? 0) + 1
    }
    const topMonth = Object.entries(byMonth).sort((a, b) => b[1] - a[1])[0] ?? null

    return {
      total: posts.length, published: published.length, drafts: drafts.length,
      byYear, years, maxByYear,
      thisWeek, thisMonth, thisYear,
      daysSinceLast,
      catCounts, catRecency,
      top4, bottom4, uniqueTags, avgTagsPerPost,
      totalWords, avgReadTime, topMonth,
    }
  }, [posts])

  if (!isAuthenticated()) return null

  function recencyBadge(r: 'week' | 'month' | 'year' | null) {
    if (r === 'week')  return <span className="text-emerald-500 dark:text-emerald-400 text-xs ml-1.5">this week</span>
    if (r === 'month') return <span className="text-amber-500  dark:text-amber-400  text-xs ml-1.5">this month</span>
    if (r === 'year')  return <span className="text-stone-400  dark:text-[#6a5ea0]  text-xs ml-1.5">this year</span>
    return null
  }

  return (
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300 flex flex-col">

      <div className="flex justify-end items-center gap-3 p-4">
        <Link to={PATH_ADMIN_DREAMS} className={navBtn} aria-label="Dreams" title="Dreams">
          <IcoDreams />
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
          <h1 className="text-5xl text-[#395144] dark:text-[#f0ecfd] leading-none" style={{ fontFamily: 'Caveat' }}>
            {currentYear}
          </h1>
        </div>

        {/* ── Goals ───────────────────────────────────────────────────────── */}
        <div className={sectionCard}>
          <h2 className={sectionTitle}>
            <span className="text-[#395144] dark:text-amber-400">◎</span>
            {currentYear} Goals
          </h2>

          {goals.length === 0 ? (
            <p className="text-stone-400 dark:text-[#5a5180] text-sm italic">
              No goals set for {currentYear} yet — edit the{' '}
              <code className="text-xs">{COOKIE_GOALS}</code> cookie to add some.
            </p>
          ) : (
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-stone-700 dark:text-[#d4cef5]">
              {goals.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Analytics ───────────────────────────────────────────────────── */}
        <div className={sectionCard}>
          <h2 className={sectionTitle}>
            <span className="text-[#dd0000] dark:text-amber-400">◈</span>
            Analytics
          </h2>

          {loading ? (
            <p className="text-stone-500 dark:text-[#8b7db8] text-sm italic text-center py-6">Loading…</p>
          ) : fetchError ? (
            <p className="text-[#dd0000] dark:text-amber-400 text-sm">{fetchError}</p>
          ) : !stats ? (
            <p className="text-stone-400 dark:text-[#5a5180] text-sm italic">No posts yet.</p>
          ) : (
            <div className="space-y-8">

              {/* KPI grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total posts',  value: stats.total },
                  { label: 'Published',    value: stats.published },
                  { label: 'Drafts',       value: stats.drafts },
                  { label: 'This year',    value: stats.thisYear },
                  { label: 'This month',   value: stats.thisMonth },
                  { label: 'This week',    value: stats.thisWeek },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-[#efead8] dark:bg-[#0f0d24] px-3 py-3 text-center">
                    <p className="text-2xl font-semibold text-[#395144] dark:text-[#f0ecfd]" style={{ fontFamily: 'Caveat' }}>
                      {value}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-[#8b7db8] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Secondary KPIs */}
              <div className="space-y-2 text-sm">
                {stats.daysSinceLast !== null && (
                  <div className="flex justify-between text-stone-600 dark:text-[#c9beed]">
                    <span>Days since last post</span>
                    <span className={`font-medium ${stats.daysSinceLast > 30 ? 'text-[#dd0000] dark:text-amber-400' : 'text-[#395144] dark:text-emerald-400'}`}>
                      {stats.daysSinceLast}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600 dark:text-[#c9beed]">
                  <span>Estimated words written</span>
                  <span className="font-medium">{stats.totalWords.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-[#c9beed]">
                  <span>Avg read time per post</span>
                  <span className="font-medium">~{stats.avgReadTime} min</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-[#c9beed]">
                  <span>Unique tags used</span>
                  <span className="font-medium">{stats.uniqueTags}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-[#c9beed]">
                  <span>Avg tags per post</span>
                  <span className="font-medium">{stats.avgTagsPerPost}</span>
                </div>
                {stats.topMonth && (
                  <div className="flex justify-between text-stone-600 dark:text-[#c9beed]">
                    <span>Most prolific month</span>
                    <span className="font-medium">{stats.topMonth[0]} ({stats.topMonth[1]} posts)</span>
                  </div>
                )}
              </div>

              {/* Posts per year bar chart */}
              {stats.years.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 dark:text-[#5a5180] mb-3">Posts per year</p>
                  <div className="space-y-2">
                    {stats.years.map(y => {
                      const count = stats.byYear[y]
                      const pct = Math.round((count / stats.maxByYear) * 100)
                      return (
                        <div key={y} className="flex items-center gap-3">
                          <span className="text-xs text-stone-500 dark:text-[#8b7db8] w-10 text-right shrink-0">{y}</span>
                          <div className="flex-1 bg-stone-200 dark:bg-[#0f0d24] rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-[#798777] dark:bg-amber-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-stone-500 dark:text-[#8b7db8] w-5 shrink-0 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Categories */}
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400 dark:text-[#5a5180] mb-3">Categories</p>
                <div className="space-y-2.5">
                  {Object.entries(stats.catCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => {
                      const pct = Math.round((count / stats.published) * 100)
                      return (
                        <div key={cat}>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-stone-600 dark:text-[#c9beed] w-28 shrink-0 truncate">{cat}</span>
                            <div className="flex-1 bg-stone-200 dark:bg-[#0f0d24] rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-[#dd0000] dark:bg-[#9d7cd8] transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-stone-500 dark:text-[#8b7db8] w-14 shrink-0 text-right">
                              {count} · {pct}%
                            </span>
                          </div>
                          {recencyBadge(stats.catRecency[cat]) && (
                            <div className="pl-[7.5rem]">{recencyBadge(stats.catRecency[cat])}</div>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Top / bottom tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 dark:text-[#5a5180] mb-3">Top tags</p>
                  <ul className="space-y-1.5">
                    {stats.top4.map(([tag, count]) => (
                      <li key={tag} className="flex justify-between text-sm">
                        <span className="text-stone-700 dark:text-[#c9beed]">{tag}</span>
                        <span className="text-stone-400 dark:text-[#5a5180]">{count}×</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 dark:text-[#5a5180] mb-3">Least used</p>
                  <ul className="space-y-1.5">
                    {stats.bottom4.map(([tag, count]) => (
                      <li key={tag} className="flex justify-between text-sm">
                        <span className="text-stone-700 dark:text-[#c9beed]">{tag}</span>
                        <span className="text-stone-400 dark:text-[#5a5180]">{count}×</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}
        </div>

      </main>
    </div>
  )
}
