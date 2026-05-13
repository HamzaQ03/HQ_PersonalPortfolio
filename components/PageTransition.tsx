'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageTransition() {
  const pathname = usePathname()
  const [transitioning, setTransitioning] = useState(false)
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname
      setTransitioning(true)
      const t = setTimeout(() => setTransitioning(false), 500)
      return () => clearTimeout(t)
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {transitioning && (
        <motion.div
          key="zoom-fade"
          style={{
            position: 'fixed', inset: 0, zIndex: 90, pointerEvents: 'none',
            background: 'rgba(0,0,0,0.7)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0.7, 0] }}
          transition={{ duration: 0.5, times: [0, 0.2, 0.7, 1], ease: 'easeInOut' }}
        />
      )}
    </AnimatePresence>
  )
}
