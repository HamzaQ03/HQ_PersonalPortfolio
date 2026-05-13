'use client'
import { useEffect, useRef } from 'react'

interface Trace {
  x1: number; y1: number
  x2: number; y2: number
  progress: number
  speed: number
}

export default function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const SPACING = 36
    let traces: Trace[] = []

    function resize() {
      if (!canvas || !ctx) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      buildTraces()
    }

    function buildTraces() {
      if (!canvas) return
      traces = []
      const cols = Math.floor(canvas.width / SPACING)
      const rows = Math.floor(canvas.height / SPACING)
      const nodes: {x:number,y:number}[] = []
      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          if ((c + r) % 2 === 0) nodes.push({ x: c * SPACING, y: r * SPACING })
        }
      }
      const shuffled = nodes.sort(() => Math.random() - 0.5)
      for (let i = 0; i < Math.min(28, Math.floor(shuffled.length / 2)); i++) {
        const a = shuffled[i * 2]
        const b = shuffled[i * 2 + 1]
        if (!a || !b) continue
        traces.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, progress: Math.random(), speed: 0.008 + Math.random() * 0.015 })
      }
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw node dots
      const cols = Math.floor(canvas.width / SPACING)
      const rows = Math.floor(canvas.height / SPACING)
      ctx.fillStyle = 'rgba(200,149,34,0.25)'
      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          if ((c + r) % 2 === 0) {
            ctx.beginPath()
            ctx.arc(c * SPACING, r * SPACING, 1.5, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      traces.forEach(t => {
        t.progress += t.speed
        if (t.progress > 1) t.progress = 0

        // Draw base trace: horizontal leg then vertical leg
        ctx.strokeStyle = 'rgba(200,149,34,0.12)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(t.x1, t.y1)
        ctx.lineTo(t.x2, t.y1) // horizontal
        ctx.lineTo(t.x2, t.y2) // vertical
        ctx.stroke()

        // Pulse dot position along the path
        const totalLen = Math.abs(t.x2 - t.x1) + Math.abs(t.y2 - t.y1)
        if (totalLen === 0) return
        const hLen = Math.abs(t.x2 - t.x1)
        const hFrac = hLen / totalLen
        let px: number, py: number
        if (t.progress <= hFrac) {
          const frac = hFrac > 0 ? t.progress / hFrac : 0
          px = t.x1 + (t.x2 - t.x1) * frac
          py = t.y1
        } else {
          const frac = (1 - hFrac) > 0 ? (t.progress - hFrac) / (1 - hFrac) : 0
          px = t.x2
          py = t.y1 + (t.y2 - t.y1) * frac
        }

        ctx.beginPath()
        ctx.arc(px, py, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(200,149,34,0.8)'
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
