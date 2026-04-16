export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[1.5rem] sm:text-[1.8rem] md:text-[2.4rem] font-bold text-stone-900 dark:text-[#f0ecfd] mb-10 flex items-center gap-3 tracking-[0.05em]"
      style={{ fontFamily: 'Capriola' }}
    >
      <span className="text-[#798777] dark:text-amber-400">◈</span>
      <span>{children}</span>
    </h2>
  )
}
