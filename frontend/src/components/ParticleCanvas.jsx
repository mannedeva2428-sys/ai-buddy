import { useEffect, useRef } from 'react'

class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }
}

export default function ParticleCanvas({
  count = 70,
  speed = 1,
  connectDist = 120,
  showVectors = true,
  particleColor = 'rgba(129, 140, 248, 0.8)',
  lineColor = 'rgba(99, 102, 241, ',
  vectorColor = 'rgba(236, 72, 153, 0.7)',
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let particles = []
    const mouse = { x: null, y: null, radius: 150 }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = null
      mouse.y = null
    }

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    resizeCanvas()

    class Particle {
      constructor() {
        this.reset()
      }

      reset() {
        this.pos = new Vector2D(Math.random() * canvas.width, Math.random() * canvas.height)
        const angle = Math.random() * Math.PI * 2
        const spd = Math.random() * 1.2 + 0.3
        this.v = new Vector2D(Math.cos(angle) * spd, Math.sin(angle) * spd)
        this.size = Math.random() * 2 + 1.5
      }

      update() {
        this.pos.x += this.v.x * speed
        this.pos.y += this.v.y * speed

        // Wraparound canvas boundaries
        if (this.pos.x < 0) this.pos.x = canvas.width
        if (this.pos.x > canvas.width) this.pos.x = 0
        if (this.pos.y < 0) this.pos.y = canvas.height
        if (this.pos.y > canvas.height) this.pos.y = 0

        // Dynamic mouse proximity repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.pos.x
          const dy = mouse.y - this.pos.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius
            const angle = Math.atan2(dy, dx)
            this.pos.x -= Math.cos(angle) * force * 3
            this.pos.y -= Math.sin(angle) * force * 3
          }
        }
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = particleColor
        ctx.fill()

        if (showVectors) {
          const vScale = 12 * speed
          const targetX = this.pos.x + this.v.x * vScale
          const targetY = this.pos.y + this.v.y * vScale

          // Draw vector line
          ctx.beginPath()
          ctx.moveTo(this.pos.x, this.pos.y)
          ctx.lineTo(targetX, targetY)
          ctx.strokeStyle = vectorColor
          ctx.lineWidth = 1
          ctx.stroke()

          // Draw vector arrowhead
          const angle = Math.atan2(this.v.y, this.v.x)
          const arrowLength = 4
          ctx.beginPath()
          ctx.moveTo(targetX, targetY)
          ctx.lineTo(
            targetX - arrowLength * Math.cos(angle - Math.PI / 6),
            targetY - arrowLength * Math.sin(angle - Math.PI / 6)
          )
          ctx.lineTo(
            targetX - arrowLength * Math.cos(angle + Math.PI / 6),
            targetY - arrowLength * Math.sin(angle + Math.PI / 6)
          )
          ctx.fillStyle = vectorColor
          ctx.fill()
        }
      }
    }

    const initParticles = () => {
      particles = []
      for (let i = 0; i < count; i++) {
        particles.push(new Particle())
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].pos.x - particles[j].pos.x
          const dy = particles[i].pos.y - particles[j].pos.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectDist) {
            const opacity = 1 - dist / connectDist
            ctx.beginPath()
            ctx.moveTo(particles[i].pos.x, particles[i].pos.y)
            ctx.lineTo(particles[j].pos.x, particles[j].pos.y)
            ctx.strokeStyle = `${lineColor}${opacity * 0.35})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    initParticles()
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [count, speed, connectDist, showVectors, particleColor, lineColor, vectorColor])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}
