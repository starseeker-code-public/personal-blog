interface PaginationProps {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, total, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-[#322d5a] text-stone-600 dark:text-[#c9beed] text-sm
          hover:border-amber-600 hover:text-stone-900 dark:hover:border-amber-500 dark:hover:text-[#f0ecfd] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ←
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
            p === page
              ? 'bg-amber-600 dark:bg-amber-500 text-stone-900 dark:text-[#0f0d24] border border-amber-500 dark:border-amber-400'
              : 'border border-stone-300 dark:border-[#322d5a] text-stone-600 dark:text-[#c9beed] hover:border-amber-600 hover:text-stone-900 dark:hover:border-amber-500 dark:hover:text-[#f0ecfd]'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-[#322d5a] text-stone-600 dark:text-[#c9beed] text-sm
          hover:border-amber-600 hover:text-stone-900 dark:hover:border-amber-500 dark:hover:text-[#f0ecfd] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        →
      </button>
    </nav>
  )
}
