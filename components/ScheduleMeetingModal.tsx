'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { playClickSound } from '@/lib/sound'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ScheduleMeetingModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const [closeHover, setCloseHover] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape key closes modal
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { playClickSound(); onClose() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0a0a0a',
              border: '1px solid #c8a87c',
              borderRadius: 12,
              width: '100%',
              maxWidth: 900,
              maxHeight: '88vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(200,168,124,0.05)',
              position: 'relative',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid rgba(200,168,124,0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              {/* Left: labels */}
              <div>
                <p style={{
                  fontFamily: 'monospace',
                  fontSize: 10,
                  color: '#c8a87c',
                  letterSpacing: 3,
                  margin: 0,
                }}>// SCHEDULE</p>
                <h2 style={{
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontWeight: 700,
                  fontSize: 22,
                  color: '#ffffff',
                  margin: '4px 0 0',
                }}>Book a Meeting</h2>
                <p style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: '#c8a87c',
                  margin: '4px 0 0',
                }}>Schedule a 30-minute interview or chat directly on my calendar.</p>
              </div>

              {/* Right: close button */}
              <button
                onClick={() => { playClickSound(); onClose() }}
                onMouseEnter={() => setCloseHover(true)}
                onMouseLeave={() => setCloseHover(false)}
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: closeHover ? '#ffffff' : '#c8a87c',
                  letterSpacing: 2,
                  padding: '6px 12px',
                  border: `1px solid ${closeHover ? '#c8a87c' : 'rgba(200,168,124,0.3)'}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: closeHover ? 'rgba(200,168,124,0.1)' : 'transparent',
                  transition: 'all 180ms ease',
                  flexShrink: 0,
                }}
              >✕ CLOSE</button>
            </div>

            {/* ── Calendly iframe ── */}
            <div style={{
              flex: 1,
              overflow: 'hidden',
              width: '100%',
              height: 650,
              background: '#ffffff',
            }}>
              <iframe
                src="https://calendly.com/hamza-qureshi/30min?embed_domain=hamzaqureshi.com&embed_type=Inline"
                width="100%"
                height="100%"
                frameBorder={0}
                style={{ minHeight: 650, border: 'none', display: 'block' }}
                title="Schedule a Meeting"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
