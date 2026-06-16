'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  useEffect(() => {
    // Skip Lenis on the Skills page — native browser scroll is lighter there,
    // where hundreds of marquee cards already animate every frame.
    // Skip Lenis on /home too — the home page is locked to 100vh with no
    // scroll; Lenis still intercepting wheel events would prevent the
    // natural no-op behavior wheel scroll should have when there's nothing
    // to scroll.
    if (pathname === '/skills' || pathname === '/home') return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    })

    let rafId = 0
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [pathname])

  return <>{children}</>
}
