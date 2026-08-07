import { useEffect, useState } from 'react'

export default function AudioSpectrum({ isActive }) {
  const [heights, setHeights] = useState(() => Array(24).fill(4))

  useEffect(() => {
    let animId
    const tick = () => {
      if (isActive) {
        setHeights(
          Array(24)
            .fill(0)
            .map(() => Math.floor(Math.random() * 40) + 4)
        )
      } else {
        setHeights(Array(24).fill(4))
      }
      animId = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(animId)
  }, [isActive])

  return (
    <div className="w-full h-full flex items-center justify-center gap-1">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1 bg-gradient-to-t from-cyan-500 via-sky-400 to-indigo-400 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  )
}
