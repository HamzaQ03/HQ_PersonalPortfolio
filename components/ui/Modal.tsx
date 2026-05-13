'use client'
import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playClickSound } from '@/lib/sound'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export default function Modal({ open, onClose, children }: ModalProps) {
  function handleClose() {
    playClickSound()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — closes modal but no sound (non-interactive background click) */}
          <motion.div
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(4px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          {/* Modal card */}
          <motion.div
            style={{
              position: 'fixed', inset: 0, zIndex: 1001,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.5rem',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              style={{
                background: '#0a0a0a',
                border: '1px solid rgba(200,168,124,0.25)',
                borderRadius: 12,
                maxWidth: 560,
                width: '100%',
                padding: 28,
                position: 'relative',
                pointerEvents: 'auto',
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close button — plays sound */}
              <button
                onClick={handleClose}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  fontFamily: 'monospace', fontSize: 11,
                  color: '#c8a87c',
                  border: '1px solid rgba(200,168,124,0.3)',
                  borderRadius: 4,
                  padding: '2px 8px',
                  background: 'transparent',
                  cursor: 'none',
                  letterSpacing: '0.1em',
                }}
              >
                ✕ CLOSE
              </button>
              <div style={{ marginTop: 8 }}>{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
