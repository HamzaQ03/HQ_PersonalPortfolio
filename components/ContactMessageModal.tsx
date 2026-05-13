'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { playClickSound } from '@/lib/sound'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const A  = '#c8a87c'
const T  = '#f0f0f0'
const TM = '#666677'

const inputStyle: React.CSSProperties = {
  background: '#000000',
  border: '1px solid rgba(200,168,124,0.25)',
  color: '#e0e0e0',
  fontFamily: 'monospace',
  fontSize: 12,
  padding: '10px 12px',
  borderRadius: 6,
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 9,
  color: A,
  letterSpacing: 2,
  display: 'block',
  marginBottom: 6,
}

export default function ContactMessageModal({ isOpen, onClose }: Props) {
  const [mounted,    setMounted]    = useState(false)
  const [fullName,   setFullName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [company,    setCompany]    = useState('')
  const [message,    setMessage]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Body scroll lock — mirrors ModalShell behaviour
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ESC key close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const isValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    message.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || submitting) return
    playClickSound()
    setSubmitting(true)
    // Placeholder — wire up to Resend / EmailJS / API route when ready:
    console.log('Contact message submitted:', { fullName, email, phone, company, message })
    await new Promise(r => setTimeout(r, 800))
    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFullName(''); setEmail(''); setPhone(''); setCompany(''); setMessage('')
      onClose()
    }, 2000)
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            overflowY: 'auto',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            onWheel={e => e.stopPropagation()}
            style={{
              position: 'relative',
              background: '#0a0a0a',
              border: '1px solid rgba(200,168,124,0.25)',
              borderRadius: 12,
              width: '100%',
              maxWidth: 540,
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              margin: 'auto',
              overflow: 'hidden',
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
                <p style={{
                  fontFamily: 'monospace', fontSize: 9,
                  color: A, letterSpacing: 2.5,
                  margin: '0 0 6px',
                }}>
                  ▸ TRANSMISSION CHANNEL
                </p>
                <h3 style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  fontWeight: 700, fontSize: 22, color: T, margin: 0,
                }}>
                  Send a Message
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

            {/* ── Scrollable body ───────────────────────── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 13,
                color: TM, lineHeight: 1.7, margin: '0 0 24px',
              }}>
                Drop a note below and I&apos;ll get back to you as soon as possible.
                Whether it&apos;s an opportunity, a question, or just a hello —
                your message reaches me directly.
              </p>

              <form
                id="contact-msg-form"
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {/* Full Name */}
                <div>
                  <label style={labelStyle}>
                    FULL NAME&nbsp;<span style={{ color: A, fontWeight: 700 }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    required
                    style={inputStyle}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    disabled={submitting || submitted}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>
                    EMAIL&nbsp;<span style={{ color: A, fontWeight: 700 }}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    required
                    style={inputStyle}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={submitting || submitted}
                  />
                </div>

                {/* Phone (optional) */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                    PHONE
                    <span style={{
                      color: TM, fontSize: 9,
                      fontStyle: 'italic', letterSpacing: 1,
                      textTransform: 'none', fontWeight: 400,
                    }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    style={inputStyle}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={submitting || submitted}
                  />
                </div>

                {/* Company / Organization (optional) */}
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                    COMPANY / ORGANIZATION
                    <span style={{
                      color: TM, fontSize: 9,
                      fontStyle: 'italic', letterSpacing: 1,
                      textTransform: 'none', fontWeight: 400,
                    }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Where you work"
                    style={inputStyle}
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    disabled={submitting || submitted}
                  />
                </div>

                {/* Message */}
                <div>
                  <label style={labelStyle}>
                    MESSAGE&nbsp;<span style={{ color: A, fontWeight: 700 }}>*</span>
                  </label>
                  <textarea
                    placeholder="Your message..."
                    rows={6}
                    required
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: 120,
                      fontFamily: 'Inter, sans-serif',
                    }}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    disabled={submitting || submitted}
                  />
                </div>
              </form>
            </div>

            {/* ── Sticky footer ─────────────────────────── */}
            <div style={{
              flexShrink: 0,
              padding: '16px 32px 24px',
              borderTop: '1px solid rgba(200,168,124,0.12)',
            }}>
              <button
                type="submit"
                form="contact-msg-form"
                disabled={!isValid || submitting || submitted}
                style={{
                  width: '100%',
                  fontFamily: 'monospace', fontSize: 12, letterSpacing: 2,
                  background: submitted
                    ? 'rgba(34,197,94,0.1)'
                    : 'rgba(200,168,124,0.1)',
                  border: `1px solid ${submitted
                    ? 'rgba(34,197,94,0.5)'
                    : 'rgba(200,168,124,0.5)'}`,
                  color: submitted ? '#22c55e' : A,
                  padding: 12, borderRadius: 6,
                  cursor: !isValid || submitting || submitted ? 'not-allowed' : 'pointer',
                  opacity: !isValid && !submitted && !submitting ? 0.45 : 1,
                  transition: 'all 200ms',
                }}
              >
                {submitted
                  ? '✓ MESSAGE TRANSMITTED'
                  : submitting
                    ? '[ TRANSMITTING... ]'
                    : '[ TRANSMIT MESSAGE ]'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
