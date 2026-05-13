'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function SpotlightOverlay() {
  const pathname = usePathname()
  const [pos, setPos] = useState({ x: -9999, y: -9999 })
  const isSplash = pathname === '/'

  useEffect(() => {
    if (isSplash) return
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [isSplash])

  if (isSplash) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(200,168,124,0.04) 0%, transparent 100%)`,
      }}
    />
  )
}
