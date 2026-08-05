import { useEffect, useRef } from 'react'

/**
 * VoiceOrb — Signature visual element: A canvas-rendered rotating plasma silk wave energy orb
 * that dynamically reacts to voice listening, speaking, and idle states.
 */
export default function VoiceOrb({ state = 'idle', onClick, disabled, size = 96 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let orbAngle = 0

    const isListening = state === 'listening'
    const isSpeaking = state === 'speaking'

    const render = () => {
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const radius = w * 0.35

      ctx.clearRect(0, 0, w, h)

      // 3 Rotating Plasma Silk Wave Loops
      for (let i = 0; i < 3; i++) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(orbAngle * (i % 2 === 0 ? 1 : -1) + (i * Math.PI) / 3)

        ctx.beginPath()
        const speedMultiplier = isListening ? 2.5 : isSpeaking ? 2.0 : 1.0
        const waveAmp = isListening ? 6 : isSpeaking ? 4.5 : 2.5

        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          const wave = Math.sin(a * 3 + orbAngle * speedMultiplier) * waveAmp
          const r = radius + wave
          const x = r * Math.cos(a)
          const y = r * Math.sin(a) * 0.85
          if (a === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()

        // Neon Glow Radial Shader Gradients
        const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, radius + 8)
        if (i === 0) {
          grad.addColorStop(0, 'rgba(236, 72, 153, 0.9)')
          grad.addColorStop(1, 'rgba(168, 85, 247, 0.25)')
        } else if (i === 1) {
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.9)')
          grad.addColorStop(1, 'rgba(99, 102, 241, 0.25)')
        } else {
          grad.addColorStop(0, 'rgba(217, 70, 239, 0.9)')
          grad.addColorStop(1, 'rgba(59, 130, 246, 0.25)')
        }

        ctx.strokeStyle = grad
        ctx.lineWidth = isListening ? 3 : 2.2
        ctx.shadowBlur = isListening ? 12 : 8
        ctx.shadowColor = i === 0 ? '#ec4899' : i === 1 ? '#38bdf8' : '#d946ef'
        ctx.stroke()
        ctx.restore()
      }

      orbAngle += isListening ? 0.05 : isSpeaking ? 0.035 : 0.02
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [state])

  const ringColor =
    state === 'listening' ? 'bg-pink-500' : state === 'speaking' ? 'bg-emerald-500' : 'bg-indigo-500'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-40 disabled:cursor-not-allowed group transition-transform hover:scale-105 active:scale-95"
      aria-pressed={state === 'listening'}
      aria-label={state === 'listening' ? 'Stop listening' : 'Start listening'}
    >
      {(state === 'listening' || state === 'speaking') && (
        <>
          <span className={`absolute inline-flex h-full w-full rounded-full ${ringColor} opacity-30 animate-pulseRing`} />
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${ringColor} opacity-30 animate-pulseRing`}
            style={{ animationDelay: '0.4s' }}
          />
        </>
      )}

      {/* Plasma Canvas Energy Loop */}
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        className="absolute inset-0 w-full h-full pointer-events-none rounded-full"
      />

      {/* Microphone Icon Center Badge */}
      <span
        className={`relative z-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
          size < 60 ? 'h-8 w-8' : 'h-16 w-16'
        } ${
          state === 'listening'
            ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-pink-500/40'
            : state === 'speaking'
            ? 'bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/40'
            : 'bg-slate-900/90 border border-white/20 shadow-brand-500/20'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          className={size < 60 ? 'h-4 w-4' : 'h-7 w-7'}
        >
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10v1a7 7 0 0 0 14 0v-1" strokeLinecap="round" />
          <path d="M12 18v3" strokeLinecap="round" />
          <path d="M8 21h8" strokeLinecap="round" />
        </svg>
      </span>
    </button>
  )
}
