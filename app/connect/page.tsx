'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { playClickSound } from '@/lib/sound'
import ScheduleMeetingModal from '@/components/ScheduleMeetingModal'
import ContactMessageModal from '@/components/ContactMessageModal'
import { useTypewriter } from '@/components/hooks/useTypewriter'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const vp = { once: true, margin: '-60px' }
const trans = (d = 0) => ({ duration: 0.6, ease: 'easeOut' as const, delay: d })

const A  = '#c8a87c'
const T  = '#f0f0f0'
const TM = '#666677'

const LINKEDIN_URL = 'https://www.linkedin.com/in/hamza-qureshi-71b8331b2/'

/* ── Ordinal date helper ─────────────────────────────── */

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function formatLetterDate(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return `${months[date.getMonth()]} ${getOrdinal(date.getDate())}, ${date.getFullYear()}`
}

/* ── Shared modal shell ──────────────────────────────── */

function ModalShell({
  open, onClose, maxWidth = 480, children,
}: {
  open: boolean; onClose: () => void; maxWidth?: number; children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
              maxWidth,
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: 32,
              margin: 'auto',
            }}
          >
            <button
              onClick={() => { playClickSound(); onClose() }}
              style={{
                position: 'absolute', top: 16, right: 16, zIndex: 10,
                fontFamily: 'monospace', fontSize: 10,
                color: 'rgba(200,168,124,0.7)', border: '1px solid rgba(200,168,124,0.3)',
                background: 'transparent', padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
              }}
            >✕ CLOSE</button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/* ── Contact Information Modal ───────────────────────── */

function ContactItem({
  icon, label, value,
}: { icon: string; label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div
      onClick={handleCopy}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', position: 'relative' }}
    >
      <span style={{ fontSize: 18, color: A, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div>
        <p style={{ fontFamily: 'monospace', fontSize: 9, color: A, letterSpacing: 2, margin: '0 0 4px' }}>
          {label}
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#e0e0e0', margin: 0 }}>
          {value}
        </p>
      </div>
      {copied && (
        <span style={{
          position: 'absolute', right: 0, top: 0,
          fontFamily: 'monospace', fontSize: 10, color: '#22c55e',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          padding: '2px 8px', borderRadius: 4,
        }}>Copied!</span>
      )}
    </div>
  )
}

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalShell open={open} onClose={onClose} maxWidth={480}>
      <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 22, color: T, margin: '0 0 28px' }}>
        Contact Information
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <ContactItem icon="✉" label="PERSONAL EMAIL" value="moehamzza@gmail.com" />
        <ContactItem icon="✉" label="WORK EMAIL"     value="hamza.qureshi@triplepointsecurity.com" />
        <ContactItem icon="☎" label="PHONE"          value="240-869-0210" />
      </div>
    </ModalShell>
  )
}

/* ── Resume Access Modal ─────────────────────────────── */

const resumeInputStyle: React.CSSProperties = {
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

function ResumeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fullName,    setFullName]    = useState('')
  const [workEmail,   setWorkEmail]   = useState('')
  const [company,     setCompany]     = useState('')
  const [phone,       setPhone]       = useState('')
  const [reason,      setReason]      = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function resetAndClose() {
    onClose()
    setTimeout(() => {
      setFullName(''); setWorkEmail(''); setCompany(''); setPhone(''); setReason('')
      setSubmitted(false); setSubmitError(null)
    }, 300)
  }

  const isValid =
    fullName.trim().length > 0 &&
    workEmail.trim().length > 0 &&
    company.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || submitting) return

    playClickSound()
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/resume-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName:  fullName.trim(),
          workEmail: workEmail.trim(),
          company:   company.trim(),
          phone:     phone.trim(),
          reason:    reason.trim(),
        }),
      })

      const data = await res.json().catch(() => ({ ok: false }))

      if (!res.ok || !data.ok) {
        setSubmitError(data?.error || 'Request failed. Please try again.')
        setSubmitting(false)
        return
      }

      setSubmitted(true)

      setTimeout(() => {
        setFullName(''); setWorkEmail(''); setCompany(''); setPhone(''); setReason('')
        setSubmitted(false); setSubmitError(null)
        onClose()
      }, 4000)
    } catch (err) {
      console.error('Resume access form error:', err)
      setSubmitError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'monospace', fontSize: 9, color: A, letterSpacing: 2,
    display: 'block', marginBottom: 6,
  }

  return (
    <ModalShell open={open} onClose={resetAndClose} maxWidth={540}>
      <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 22, color: T, margin: '0 0 12px' }}>
        Request Resume Access
      </h3>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: TM, lineHeight: 1.7, margin: '0 0 24px' }}>
        Below, please submit your details to request resume access. Requests are
        reviewed and approved within 48 hours, typically faster. Once approved, you
        will receive a secure download link from contact@hamzaqureshi.dev.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Full Name */}
        <div>
          <label style={labelStyle}>
            FULL NAME <span style={{ color: A }}>*</span>
          </label>
          <input
            required type="text" placeholder="Your full name"
            style={resumeInputStyle}
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            disabled={submitting || submitted}
          />
        </div>

        {/* Work Email */}
        <div>
          <label style={labelStyle}>
            WORK EMAIL <span style={{ color: A }}>*</span>
          </label>
          <input
            required type="email" placeholder="you@company.com"
            style={resumeInputStyle}
            value={workEmail}
            onChange={e => setWorkEmail(e.target.value)}
            disabled={submitting || submitted}
          />
        </div>

        {/* Company / Organization */}
        <div>
          <label style={labelStyle}>
            COMPANY / ORGANIZATION <span style={{ color: A }}>*</span>
          </label>
          <input
            required type="text" placeholder="Where you work"
            style={resumeInputStyle}
            value={company}
            onChange={e => setCompany(e.target.value)}
            disabled={submitting || submitted}
          />
        </div>

        {/* Phone — optional */}
        <div>
          <label style={labelStyle}>PHONE</label>
          <input
            type="tel" placeholder="+1 (000) 000-0000"
            style={resumeInputStyle}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            disabled={submitting || submitted}
          />
        </div>

        {/* Reason — optional textarea */}
        <div>
          <label style={labelStyle}>REASON FOR REQUEST</label>
          <textarea
            rows={4}
            placeholder="Optional. Although a short note about the nature of your request would be highly appreciated"
            style={{
              ...resumeInputStyle,
              resize: 'vertical',
              minHeight: 90,
              fontFamily: 'Inter, sans-serif',
            }}
            value={reason}
            onChange={e => setReason(e.target.value)}
            disabled={submitting || submitted}
          />
        </div>

        {/* Submit button — 4-state UI */}
        <button
          type="submit"
          disabled={!isValid || submitting || submitted}
          style={{
            fontFamily: 'monospace', fontSize: 12, letterSpacing: 2,
            background: submitted
              ? 'rgba(34,197,94,0.1)'
              : submitError
                ? 'rgba(180,30,30,0.15)'
                : 'rgba(200,168,124,0.1)',
            border: `1px solid ${
              submitted
                ? 'rgba(34,197,94,0.5)'
                : submitError
                  ? 'rgba(220,60,60,0.6)'
                  : 'rgba(200,168,124,0.5)'
            }`,
            color: submitted ? '#22c55e' : submitError ? '#ff6464' : A,
            padding: 12, borderRadius: 6,
            cursor: !isValid || submitting || submitted ? 'not-allowed' : 'pointer',
            opacity: !isValid && !submitted && !submitting && !submitError ? 0.45 : 1,
            transition: 'all 200ms',
            width: '100%', marginTop: 12,
          }}
        >
          {submitted
            ? '✓ REQUEST RECEIVED'
            : submitting
              ? '[ SUBMITTING... ]'
              : submitError
                ? '✗ REQUEST FAILED — TAP TO RETRY'
                : '[ REQUEST ACCESS ]'}
        </button>

        {/* Success body — 4s window before auto-close */}
        {submitted && (
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#22c55e',
            lineHeight: 1.6,
            textAlign: 'center',
            marginTop: 4,
          }}>
            Your request has been received. You will receive an email response within 48 hours, typically faster.
          </div>
        )}

        {/* Error message from the API — inline, red, retry via button */}
        {submitError && !submitted && (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: '#ff6464',
            letterSpacing: 1,
            textAlign: 'center',
            lineHeight: 1.6,
            marginTop: 4,
          }}>
            {submitError}
          </div>
        )}
      </form>
    </ModalShell>
  )
}

/* ── Bookmark card ───────────────────────────────────── */

interface BookmarkCardProps {
  number: string
  name: string     // use \n for line breaks
  subtitle: string
  onClick: () => void
}

function BookmarkCard({ number, name, subtitle, onClick }: BookmarkCardProps) {
  const [hovered, setHovered] = useState(false)
  const lines = name.split('\n')

  return (
    <div style={{ position: 'relative', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        style={{
          width: 110,
          height: 200,
          position: 'relative',
          cursor: 'pointer',
          padding: '18px 8px 24px',
          boxSizing: 'border-box',
          clipPath: 'polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)',
          background: 'linear-gradient(180deg, #faf8f3, #ebe7dc)',
          border: '1px solid rgba(140,90,44,0.2)',
          boxShadow: hovered
            ? '0 14px 28px rgba(0,0,0,0.6)'
            : '0 6px 18px rgba(0,0,0,0.5)',
          transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 250ms ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* No. header */}
        <span style={{
          fontFamily: "'Times New Roman', serif",
          fontStyle: 'italic',
          fontSize: 9,
          color: '#4a3020',
          letterSpacing: 2,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          display: 'block',
        }}>
          — {number} —
        </span>

        {/* Name */}
        <span
          className="bk-name"
          style={{
            fontFamily: "'Times New Roman', serif",
            fontWeight: 700,
            fontSize: 13,
            color: '#1a1410',
            letterSpacing: 1,
            textAlign: 'center',
            lineHeight: 1.2,
            marginTop: 14,
            display: 'block',
          }}
        >
          {lines.map((line, i) => (
            <span key={i} style={{ display: 'block' }}>{line}</span>
          ))}
        </span>

        {/* Rule */}
        <div style={{
          width: '30%',
          height: 1,
          background: '#4a3020',
          margin: '10px auto',
          flexShrink: 0,
        }} />

        {/* Subtitle */}
        <span style={{
          fontFamily: "'Times New Roman', serif",
          fontStyle: 'italic',
          fontSize: 11,
          color: '#4a3020',
          textAlign: 'center',
          display: 'block',
        }}>
          {subtitle}
        </span>
      </button>

      {/* ── Tapered gold inkdrop ── */}
      <svg
        width="110"
        height="60"
        viewBox="0 0 110 60"
        style={{ display: 'block', marginTop: '-2px', pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <path
          d="M 50 0 Q 55 30 55 50 Q 55 30 60 0"
          fill="#1a1410"
          opacity="0.9"
        />
      </svg>
    </div>
  )
}

/* ── Parchment Letter ────────────────────────────────── */

interface ParchmentLetterProps {
  onLinkedIn:    () => void
  onContactInfo: () => void
  onResume:      () => void
  onSchedule:    () => void
  onSendText:    () => void
}

const P1_TEXT = 'Dear Visitor,'
const P2_TEXT = 'Glad to see you made it this far.'
const P3_TEXT = 'If you\'re reading this, something on the previous pages probably caught your attention. Whether it\'s a project, a question, an opportunity, or just a simple "hello", whichever it is, I\'d genuinely love to hear from you.'
const P4_TEXT = 'Below are five ways to reach me. Pick whichever suits you well. My door is always open for meaningful conversations and new connections, so let\'s connect and build something great together.'

function ParchmentLetter({
  onLinkedIn, onContactInfo, onResume, onSchedule, onSendText,
}: ParchmentLetterProps) {
  const [letterDate, setLetterDate] = useState('')
  const [mounted, setMounted] = useState(false)
  const [shouldPlay, setShouldPlay] = useState(false)

  useEffect(() => { setLetterDate(formatLetterDate(new Date())) }, [])
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const hasPlayed = sessionStorage.getItem('connect-typewriter-played')
      if (!hasPlayed) {
        setShouldPlay(true)
        sessionStorage.setItem('connect-typewriter-played', '1')
      }
    } catch {
      setShouldPlay(false)
    }
  }, [])

  const shouldAnimate = mounted && shouldPlay

  const p1 = useTypewriter(P1_TEXT, 35, 0, shouldAnimate)
  const p2 = useTypewriter(P2_TEXT, 28, shouldAnimate ? 700 : 0, shouldAnimate)
  const p3 = useTypewriter(P3_TEXT, 22, shouldAnimate ? 2200 : 0, shouldAnimate)
  const p4 = useTypewriter(P4_TEXT, 22, shouldAnimate ? 7000 : 0, shouldAnimate)

  const monoBody: React.CSSProperties = {
    fontFamily: "'Georgia', serif",
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.9,
    color: '#1a1410',
  }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .parchment-letter {
            transform: rotate(0deg) !important;
          }
          .bk-row {
            gap: 10px !important;
          }
          .bk-name {
            font-size: 12px !important;
          }
        }
      `}</style>

      <div
        className="parchment-letter"
        style={{
          width: '100%',
          maxWidth: 900,
          margin: '0 auto 60px',
          padding: '50px 60px 90px',
          background: 'linear-gradient(180deg, #f5e8d4 0%, #ead7b8 50%, #f5e8d4 100%)',
          borderRadius: 4,
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 0 60px rgba(140,90,44,0.08)',
          position: 'relative',
          fontFamily: "'Courier New', Courier, monospace",
          color: '#2a1810',
          transform: 'rotate(-0.3deg)',
        }}
      >
          {/* Inner dashed border */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 8, left: 14, right: 14, bottom: 8,
              border: '1px dashed rgba(42,24,16,0.15)',
              pointerEvents: 'none',
              borderRadius: 2,
            }}
          />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 0 }}>
            <p style={{
              fontFamily: "'Times New Roman', serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 13,
              color: '#8c5a2c',
              letterSpacing: 4,
              margin: '0 0 6px',
            }}>
              — FROM THE DESK OF —
            </p>
            <p style={{
              fontFamily: "'Times New Roman', serif",
              fontWeight: 700,
              fontSize: 22,
              color: '#2a1810',
              letterSpacing: 6,
              margin: 0,
              paddingBottom: 16,
              borderBottom: '1px solid rgba(140,90,44,0.3)',
            }}>
              HAMZA QURESHI
            </p>
          </div>

          {/* Date */}
          <p style={{
            fontFamily: "'Georgia', serif",
            fontStyle: 'italic',
            fontSize: 11,
            fontWeight: 700,
            color: '#1a1410',
            textAlign: 'right',
            margin: '16px 0 24px',
          }}>
            {letterDate}
          </p>

          {/* Body copy — four paragraphs, typewriter animated on first session visit */}
          <p style={{ ...monoBody, margin: '0 0 22px' }}>
            {p1.displayed}
          </p>
          <p style={{ ...monoBody, margin: '0 0 22px' }}>
            {p2.displayed}
          </p>
          <p style={{ ...monoBody, margin: '0 0 22px' }}>
            {p3.displayed}
          </p>
          <p style={{ ...monoBody, margin: '0 0 30px' }}>
            {p4.displayed}
            {p4.isDone && (
              <span className="typewriter-cursor" aria-hidden="true">|</span>
            )}
          </p>

          {/* ── Bookmark row ── */}
          <div
            className="bk-row"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
              margin: '30px 0',
              paddingBottom: 50,
            }}
          >
            {/* ── Change 5: LINKEDIN → LINKEDIN REDIRECT ── */}
            <BookmarkCard
              number="No. 01"
              name={'LINKEDIN\nREDIRECT'}
              subtitle="▸ Network ▸"
              onClick={onLinkedIn}
            />
            <BookmarkCard
              number="No. 02"
              name={'CONTACT\nINFO'}
              subtitle="▸ Direct ▸"
              onClick={onContactInfo}
            />
            <BookmarkCard
              number="No. 03"
              name={'DOWNLOAD\nRESUME'}
              subtitle="▸ Request ▸"
              onClick={onResume}
            />
            <BookmarkCard
              number="No. 04"
              name={'SCHEDULE\nMEETING'}
              subtitle="▸ 30 Min ▸"
              onClick={onSchedule}
            />
            <BookmarkCard
              number="No. 05"
              name={'SEND A\nTEXT'}
              subtitle="▸ Message ▸"
              onClick={onSendText}
            />
          </div>

          {/* Sign-off */}
          <p style={{ ...monoBody, margin: '0 0 12px' }}>
            Awaiting your response,
          </p>
          <p style={{
            fontFamily: "'Times New Roman', serif",
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 18,
            color: '#2a1810',
            margin: '0 0 4px',
          }}>
            — Hamza Qureshi
          </p>
          <p style={{
            fontFamily: "'Georgia', serif",
            fontSize: 11,
            fontWeight: 700,
            color: '#1a1410',
            letterSpacing: 1,
            margin: 0,
          }}>
            Cybersecurity Compliance Specialist
          </p>

      </div>
    </>
  )
}

/* ── Page ────────────────────────────────────────────── */

export default function ConnectPage() {
  const [contactOpen,        setContactOpen]        = useState(false)
  const [resumeOpen,         setResumeOpen]         = useState(false)
  const [scheduleOpen,       setScheduleOpen]       = useState(false)
  const [contactMessageOpen, setContactMessageOpen] = useState(false)

  function handleLinkedIn() {
    playClickSound()
    window.open(LINKEDIN_URL, '_blank')
  }

  function handleContactInfo() {
    playClickSound()
    setContactOpen(true)
  }

  function handleResume() {
    playClickSound()
    setResumeOpen(true)
  }

  function handleSchedule() {
    playClickSound()
    setScheduleOpen(true)
  }

  function handleSendText() {
    playClickSound()
    setContactMessageOpen(true)
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto">

        {/* ── Parchment letter with bookmarks ── */}
        <section id="contact-info" className="scroll-mt-24">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.2)}>
            <ParchmentLetter
              onLinkedIn={handleLinkedIn}
              onContactInfo={handleContactInfo}
              onResume={handleResume}
              onSchedule={handleSchedule}
              onSendText={handleSendText}
            />
          </motion.div>
        </section>
      </div>

      {/* Modals */}
      <ContactModal         open={contactOpen}        onClose={() => setContactOpen(false)} />
      <ResumeModal          open={resumeOpen}         onClose={() => setResumeOpen(false)} />
      <ScheduleMeetingModal open={scheduleOpen}       onClose={() => setScheduleOpen(false)} />
      <ContactMessageModal  isOpen={contactMessageOpen} onClose={() => setContactMessageOpen(false)} />
    </div>
  )
}
