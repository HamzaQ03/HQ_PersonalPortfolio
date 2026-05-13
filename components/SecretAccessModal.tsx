'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { playClickSound } from '@/lib/sound'

/* ── Types ───────────────────────────────────────────── */

interface Props {
  open: boolean
  onClose: () => void
}

const BUTTONS = [
  { icon: '▸', label: 'Access Source Code Files',   response: 'Trying to steal my code huh? I see you.' },
  { icon: '◈', label: "View Hamza's Passwords",      response: "Nice try. The only thing more secure than my passwords is my trust issues." },
  { icon: '⬢', label: "Access Hamza's DMs",          response: "Mostly LinkedIn recruiters and my mom asking if I've eaten. You wouldn't survive." },
  { icon: '⚠', label: 'Initiate Self-Destruct',      response: "If only. This portfolio survived 2,569 redesigns and a mental breakdown. It's invincible now." },
  { icon: '⬡', label: 'Replace Ownership',           response: "AI's already doing that lol. It helped build half of this portfolio. You really wanna be added on the list?" },
  { icon: '◆', label: 'Format Hard Drive',           response: "Already corrupted from too many 'one final tweak' moments at 3am. Save your energy." },
  { icon: '⬣', label: 'Decode Bugs',                 response: "All bugs are features in disguise. Have you considered therapy instead of accountability?" },
  { icon: '◇', label: 'Redesign This Portfolio',     response: "NO. NOT AGAIN. I've redone the splash screen 959 times. My therapist says no." },
]

/* ── Helpers ─────────────────────────────────────────── */

function randomHex(len: number) {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

function fmtTime(secs: number) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
}

/* ── Corner bracket ──────────────────────────────────── */

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const style: React.CSSProperties = {
    position: 'absolute', width: 20, height: 20,
    borderColor: 'rgba(200,168,124,0.6)', borderStyle: 'solid',
    borderWidth: 0,
    ...(pos === 'tl' ? { top: 12, left: 12, borderTopWidth: '1.5px', borderLeftWidth: '1.5px' }   : {}),
    ...(pos === 'tr' ? { top: 12, right: 12, borderTopWidth: '1.5px', borderRightWidth: '1.5px' } : {}),
    ...(pos === 'bl' ? { bottom: 12, left: 12, borderBottomWidth: '1.5px', borderLeftWidth: '1.5px' }   : {}),
    ...(pos === 'br' ? { bottom: 12, right: 12, borderBottomWidth: '1.5px', borderRightWidth: '1.5px' } : {}),
  }
  return <div style={style} />
}

/* ── Response panel with typing effect ──────────────── */

function ResponsePanel({ response, onBack }: { response: string; onBack: () => void }) {
  const [phase, setPhase]     = useState<'accessing' | 'typing' | 'done'>('accessing')
  const [displayed, setDisplayed] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // After 800ms show typing
    timerRef.current = setTimeout(() => {
      setPhase('typing')
      let i = 0
      function typeNext() {
        if (i < response.length) {
          setDisplayed(response.slice(0, i + 1))
          i++
          timerRef.current = setTimeout(typeNext, 30)
        } else {
          setPhase('done')
        }
      }
      typeNext()
    }, 800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [response])

  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)', border: '1px dashed rgba(200,168,124,0.3)',
      borderRadius: 6, padding: 24, marginTop: 12,
    }}>
      <p style={{
        fontFamily: 'monospace', fontSize: 11, color: '#ef4444',
        letterSpacing: 2, margin: 0,
        animation: phase === 'accessing' ? 'hq-pulse 0.8s ease-in-out infinite' : 'none',
      }}>
        ACCESSING SYSTEM...
      </p>

      {(phase === 'typing' || phase === 'done') && (
        <p style={{
          fontFamily: 'monospace', fontSize: 14, color: '#f0f0f0',
          lineHeight: 1.7, marginTop: 12, marginBottom: 0,
        }}>
          {displayed}
          {phase === 'typing' && (
            <span style={{ animation: 'hq-blink 0.6s step-end infinite', color: '#c8a87c' }}>▌</span>
          )}
        </p>
      )}

      <button
        onClick={() => { playClickSound(); onBack() }}
        style={{
          marginTop: 20, fontFamily: 'monospace', fontSize: 10,
          color: 'rgba(200,168,124,0.7)', border: '1px solid rgba(200,168,124,0.3)',
          background: 'transparent', padding: '4px 12px', borderRadius: 4,
          cursor: 'pointer', letterSpacing: 2,
        }}
      >← BACK TO TERMINAL</button>
    </div>
  )
}

/* ── Main modal ──────────────────────────────────────── */

export default function SecretAccessModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [activeResponse, setActiveResponse] = useState<string | null>(null)
  const [connId]   = useState(() => randomHex(8))
  const [secs, setSecs] = useState(0)

  // Live session timer
  useEffect(() => {
    if (!open) { setSecs(0); return }
    const t = setInterval(() => setSecs(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [open])

  // ESC to close
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { playClickSound(); onClose() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Reset response when modal closes
  useEffect(() => { if (!open) setTimeout(() => setActiveResponse(null), 300) }, [open])

  const handleButton = useCallback((response: string) => {
    playClickSound()
    setActiveResponse(response)
  }, [])

  if (!mounted) return null

  return createPortal(
    <>
      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes hq-scan {
          0%   { transform: translateX(-100%); opacity: 0.7; }
          50%  { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0.7; }
        }
        @keyframes hq-pulse-red {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes hq-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes hq-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              width: '100vw', height: '100vh', zIndex: 100,
              background: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px', overflowY: 'auto',
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#050505',
                border: '1px solid rgba(200,168,124,0.4)',
                borderRadius: 12,
                maxWidth: 640, width: '100%',
                maxHeight: '85vh', overflowY: 'auto',
                padding: 36,
                position: 'relative',
                margin: 'auto',
                boxShadow: '0 0 60px rgba(200,168,124,0.15), inset 0 0 80px rgba(200,168,124,0.03)',
              }}
            >
              {/* Corner brackets */}
              <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

              {/* Animated scan line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                <div style={{
                  height: 1, width: '40%',
                  background: 'linear-gradient(to right, transparent, rgba(200,168,124,0.8), transparent)',
                  animation: 'hq-scan 3s linear infinite',
                }} />
              </div>

              {/* Close button — always visible, z-index 10 */}
              <button
                onClick={() => { playClickSound(); onClose() }}
                style={{
                  position: 'absolute', top: 16, right: 16, zIndex: 10,
                  fontFamily: 'monospace', fontSize: 10, letterSpacing: 2,
                  color: 'rgba(200,168,124,0.7)', border: '1px solid rgba(200,168,124,0.3)',
                  background: 'transparent', padding: '4px 12px', borderRadius: 4, cursor: 'pointer',
                }}
              >✕ DISCONNECT</button>

              {/* ── Header ── */}

              {/* Warning bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                borderBottom: '1px dashed rgba(200,168,124,0.2)',
                paddingBottom: 14, marginBottom: 20,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: '#ef4444',
                  boxShadow: '0 0 6px rgba(239,68,68,0.8)',
                  animation: 'hq-pulse-red 1s ease-in-out infinite',
                  display: 'inline-block',
                }} />
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(239,68,68,0.7)', letterSpacing: 2 }}>
                  SECURE CHANNEL ESTABLISHED · CONNECTION ENCRYPTED
                </span>
              </div>

              {/* Main heading */}
              <h2 style={{
                fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
                fontSize: 26, color: '#f0f0f0', letterSpacing: 4, margin: '0 0 4px',
              }}>◈ RESTRICTED ACCESS</h2>

              {/* Subheading */}
              <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#c8a87c', letterSpacing: 4, margin: '0 0 12px' }}>
                AUTHORIZED PERSONNEL ONLY
              </p>

              {/* System info row */}
              <p style={{ fontFamily: 'monospace', fontSize: 9, color: '#666677', margin: '0 0 0' }}>
                SESSION: ACTIVE &nbsp;·&nbsp; ENCRYPTION: AES-256 &nbsp;·&nbsp; CLEARANCE: LVL 9
              </p>

              {/* Instruction */}
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#c8a87c', fontStyle: 'italic', margin: '18px 0 24px' }}>
                Select system to access. All actions logged.
              </p>

              {/* ── Buttons or Response ── */}
              {activeResponse ? (
                <ResponsePanel
                  response={activeResponse}
                  onBack={() => setActiveResponse(null)}
                />
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 12,
                }}>
                  {BUTTONS.map(btn => (
                    <button
                      key={btn.label}
                      onClick={() => handleButton(btn.response)}
                      style={{
                        background: 'rgba(200,168,124,0.04)',
                        border: '1px solid rgba(200,168,124,0.25)',
                        color: '#e0e0e0', fontFamily: 'monospace', fontSize: 12,
                        padding: '14px 16px', borderRadius: 6,
                        textAlign: 'left', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'all 200ms',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget
                        el.style.background = 'rgba(200,168,124,0.1)'
                        el.style.borderColor = 'rgba(200,168,124,0.5)'
                        el.style.transform = 'translateX(2px)'
                        el.style.boxShadow = '0 0 20px rgba(200,168,124,0.15)'
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget
                        el.style.background = 'rgba(200,168,124,0.04)'
                        el.style.borderColor = 'rgba(200,168,124,0.25)'
                        el.style.transform = 'translateX(0)'
                        el.style.boxShadow = 'none'
                      }}
                    >
                      <span style={{ fontFamily: 'monospace', fontSize: 14, color: '#c8a87c', marginRight: 10, flexShrink: 0 }}>{btn.icon}</span>
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Footer terminal log ── */}
              <div style={{
                borderTop: '1px dashed rgba(200,168,124,0.2)',
                paddingTop: 14, marginTop: 24,
                fontFamily: 'monospace', fontSize: 9, color: '#666677', letterSpacing: 1,
                lineHeight: 1.8,
              }}>
                <p style={{ margin: 0 }}>$ system.log [LIVE]</p>
                <p style={{ margin: 0 }}>&gt; connection_id: hq_{connId}</p>
                <p style={{ margin: 0 }}>&gt; ip_obfuscated: ***.***.***.42</p>
                <p style={{ margin: 0 }}>&gt; session_duration: {fmtTime(secs)}</p>
                <p style={{ margin: 0 }}>&gt; warning: this conversation is being judged</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  )
}
