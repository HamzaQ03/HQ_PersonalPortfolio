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
            {/* ── Sticky header ─────────────────────────── */}
            <div style={{
              flexShrink: 0,
              padding: '24px 32px 20px',
              borderBottom: '1px solid rgba(200,168,124,0.12)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
            }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  fontWeight: 700, fontSize: 22, color: '#f0f0f0', margin: 0,
                }}>
                  Book a Meeting
                </h3>
              </div>
              <button
                onClick={() => { playClickSound(); onClose() }}
                style={{
                  fontFamily: 'monospace', fontSize: 10,
                  color: 'rgba(200,168,124,0.7)',
                  border: '1px solid rgba(200,168,124,0.3)',
                  background: 'transparent',
                  padding: '4px 10px', borderRadius: 4,
                  cursor: 'pointer', flexShrink: 0, marginTop: 4,
                }}
              >
                ✕ CLOSE
              </button>
            </div>

            {/* ── Scrollable body — description + Calendly iframe.
                Mirrors the Send a Message modal pattern: the body is
                the only scrollable region. The iframe is given a
                fixed tall height so Calendly's calendar, time zone
                picker, and footer all fit inside without Calendly's
                internal scroll kicking in. ───────────────────── */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '24px 32px 0' }}>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 13,
                  color: '#666677', lineHeight: 1.7, margin: '0 0 24px',
                }}>
                  Skip the &apos;what time works for you?&apos; email chain.
                  Pick a slot below and book it directly on my calendar.
                  Looking forward to speaking with you soon.
                </p>
              </div>

              <div style={{
                width: '100%',
                height: 900,
                background: '#ffffff',
              }}>
                <iframe
                  src="https://calendly.com/hamza-qureshi/30min?embed_domain=hamzaqureshi.com&embed_type=Inline&hide_event_type_details=1&hide_gdpr_banner=1"
                  width="100%"
                  height="100%"
                  frameBorder={0}
                  style={{ border: 'none', display: 'block' }}
                  title="Schedule a Meeting"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
