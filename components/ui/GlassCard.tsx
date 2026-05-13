'use client'
import { ReactNode, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { playClickSound } from '@/lib/sound'

interface GlassCardProps {
  children: ReactNode
  className?: string
  static?: boolean
  expandable?: boolean
  onClick?: () => void
}

export default function GlassCard({
  children,
  className = '',
  static: isStatic = false,
  expandable = false,
  onClick,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })

  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%'])

  const translateX = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 })
  const translateY = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isStatic || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
    translateX.set(x * 16)
    translateY.set(y * 16)
  }

  function handleMouseLeave() {
    if (isStatic) return
    mouseX.set(0)
    mouseY.set(0)
    translateX.set(0)
    translateY.set(0)
  }

  // Play sound + invoke caller's onClick
  function handleClick() {
    if (!onClick) return
    playClickSound()
    onClick()
  }

  return (
    <motion.div
      ref={ref}
      className={`relative rounded-xl p-6 backdrop-blur-sm ${className}`}
      style={{
        background: 'rgba(10,10,10,0.8)',
        border: '1px solid rgba(200,168,124,0.15)',
        borderRadius: 12,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        rotateX: isStatic ? 0 : rotateX,
        rotateY: isStatic ? 0 : rotateY,
        translateX: isStatic ? 0 : translateX,
        translateY: isStatic ? 0 : translateY,
        cursor: onClick ? 'none' : undefined,
      }}
      whileHover={!isStatic ? {
        y: -4,
        borderColor: 'rgba(200,168,124,0.45)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      } : {}}
      transition={{ duration: 0.2 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick ? handleClick : undefined}
    >
      {/* Glare overlay */}
      {!isStatic && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, borderRadius: 12, pointerEvents: 'none',
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(200,168,124,0.07) 0%, transparent 60%)`,
            zIndex: 1,
          }}
        />
      )}
      {/* Expand hint */}
      {expandable && (
        <span
          style={{
            position: 'absolute', top: 12, right: 14,
            fontFamily: 'monospace', fontSize: 10,
            color: 'rgba(200,168,124,0.4)',
            pointerEvents: 'none', zIndex: 3,
          }}
        >
          ↗
        </span>
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </motion.div>
  )
}
