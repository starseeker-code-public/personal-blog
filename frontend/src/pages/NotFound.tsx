import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#efead8] dark:bg-[#0f0d24] font-sans transition-colors duration-300">
      <Navbar />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="text-[#798777] dark:text-amber-400 text-xs tracking-[0.3em] uppercase mb-4">404</p>
        <h1 className="text-5xl sm:text-7xl font-bold text-stone-900 dark:text-[#f0ecfd] mb-6 font-capriola">
          Not{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#798777] to-[#8a9888] dark:from-violet-400 dark:to-blue-400">
            Found
          </span>
        </h1>
        <p className="text-stone-600 dark:text-[#c9beed] max-w-sm mb-10">
          This page doesn't exist. Maybe the post was moved or deleted.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-lg bg-[#798777] hover:bg-[#8a9888] dark:bg-amber-500 dark:hover:bg-amber-400 text-stone-900 dark:text-[#0f0d24] text-sm font-medium transition-colors"
        >
          Back to blog
        </Link>
      </div>

      <Footer />
    </div>
  )
}
