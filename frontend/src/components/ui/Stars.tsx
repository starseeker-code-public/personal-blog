const STARS = Array.from({ length: 300 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() > 0.88 ? 2 : 1,
  opacity: 0.2 + Math.random() * 0.6,
}))

export function Stars() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="stars-layer absolute inset-0"
        style={{ width: '150%', height: '150%', top: '-25%', left: '-25%' }}
      >
        {STARS.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.opacity }}
          />
        ))}
      </div>
    </div>
  )
}
