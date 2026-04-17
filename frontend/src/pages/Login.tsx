import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, PATH_ADMIN_NEW } from '../data'
import { setAuth } from '../utils/auth'
import { useTheme } from '../context/ThemeContext'
import { IcoSun, IcoMoon } from '../components/icons'

export default function Login() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.verifyLogin(username, password)
      setAuth(username, password)
      navigate(PATH_ADMIN_NEW)
    } catch {
      setError('Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300 flex flex-col">

      {/* Theme toggle, top-right — the only chrome on the page */}
      <div className="flex justify-end p-4">
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg text-stone-500 dark:text-[#8b7db8] hover:text-[#dd0000] dark:hover:text-amber-400 hover:bg-[rgba(221,0,0,0.09)] dark:hover:bg-[#2d2855]/60 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <IcoSun /> : <IcoMoon />}
        </button>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="text-center mb-10">
            <h1
              className="text-5xl text-[#395144] dark:text-[#f0ecfd] mb-2 leading-none"
              style={{ fontFamily: 'Caveat' }}
            >
              Welcome back.
            </h1>
            <p className="text-stone-500 dark:text-[#8b7db8] text-sm">
              Sign in to write a new post.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-stone-200 dark:border-[#322d5a] bg-[#faf6ee] dark:bg-[#1a1735] p-7 space-y-5"
          >
            <div>
              <label
                htmlFor="username"
                className="block text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#efead8] dark:bg-[#0f0d24] border border-stone-300 dark:border-[#322d5a] text-stone-900 dark:text-[#f0ecfd] placeholder:text-stone-400 dark:placeholder:text-[#8b7db8] focus:outline-none focus:border-[#dd0000] dark:focus:border-amber-400 transition-colors"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-widest text-stone-500 dark:text-[#8b7db8] mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#efead8] dark:bg-[#0f0d24] border border-stone-300 dark:border-[#322d5a] text-stone-900 dark:text-[#f0ecfd] placeholder:text-stone-400 dark:placeholder:text-[#8b7db8] focus:outline-none focus:border-[#dd0000] dark:focus:border-amber-400 transition-colors"
                required
              />
            </div>

            {error && (
              <p className="text-[#dd0000] dark:text-amber-400 text-sm text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-2.5 rounded-lg bg-[#798777] hover:bg-[#5a6b58] dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 text-sm font-medium tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Capriola' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

        </div>
      </main>
    </div>
  )
}
