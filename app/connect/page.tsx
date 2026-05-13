'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { playClickSound } from '@/lib/sound'
import ScheduleMeetingModal from '@/components/ScheduleMeetingModal'
import ContactMessageModal from '@/components/ContactMessageModal'

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

const REASON_OPTIONS = [
  'Recruiting / Hiring opportunity',
  'Reviewing for a referral',
  'Networking / Professional connection',
  'Academic / Research collaboration',
  'Other professional reason',
]

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

type ResumeStage = 'form' | 'preview'

function ResumeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stage, setStage]         = useState<ResumeStage>('form')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    fullName: '', email: '', company: '', jobTitle: '', reason: '',
  })

  function resetAndClose() {
    onClose()
    setTimeout(() => { setStage('form'); setForm({ fullName:'', email:'', company:'', jobTitle:'', reason:'' }) }, 300)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    playClickSound()
    setSubmitting(true)
    try {
      await fetch('/api/resume-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStage('preview')
    } catch (err) {
      console.error('[resume-access]', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell open={open} onClose={resetAndClose} maxWidth={540}>
      {stage === 'form' ? (
        <>
          <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 22, color: T, margin: '0 0 12px' }}>
            Request Resume Access
          </h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: TM, lineHeight: 1.7, margin: '0 0 24px' }}>
            Thanks for your interest in my work! Please share a few quick details so I know who I&apos;m connecting with.
            You&apos;ll get instant preview access and I&apos;ll review your request to enable download.
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontFamily: 'monospace', fontSize: 9, color: A, letterSpacing: 2, display: 'block', marginBottom: 6 }}>
                FULL NAME *
              </label>
              <input required type="text" placeholder="Your full name" style={resumeInputStyle}
                value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontFamily: 'monospace', fontSize: 9, color: A, letterSpacing: 2, display: 'block', marginBottom: 6 }}>
                PROFESSIONAL EMAIL *
              </label>
              <input required type="email" placeholder="you@company.com" style={resumeInputStyle}
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontFamily: 'monospace', fontSize: 9, color: A, letterSpacing: 2, display: 'block', marginBottom: 6 }}>
                COMPANY / ORGANIZATION
              </label>
              <input type="text" placeholder="Where you work" style={resumeInputStyle}
                value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontFamily: 'monospace', fontSize: 9, color: A, letterSpacing: 2, display: 'block', marginBottom: 6 }}>
                REASON FOR ACCESSING *
              </label>
              <select required style={{ ...resumeInputStyle, appearance: 'none' as const }}
                value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}>
                <option value="" disabled>Select a reason</option>
                {REASON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                fontFamily: 'monospace', fontSize: 12, letterSpacing: 2,
                background: 'rgba(200,168,124,0.1)', border: '1px solid rgba(200,168,124,0.5)',
                color: A, padding: 12, borderRadius: 6, cursor: 'pointer', width: '100%',
                marginTop: 24,
              }}
            >
              {submitting ? 'Submitting...' : 'Request Access →'}
            </button>
          </form>
        </>
      ) : (
        <>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#22c55e', margin: '0 0 20px' }}>
            ✓ Access granted for preview
          </p>
          <iframe
            src="/resume.pdf#toolbar=0"
            width="100%"
            height="600"
            style={{ borderRadius: 8, border: '1px solid rgba(200,168,124,0.2)', display: 'block' }}
            title="Resume Preview"
          />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: TM, lineHeight: 1.7, marginTop: 16, marginBottom: 0 }}>
            Download is pending Hamza&apos;s approval. You&apos;ll receive an email at the address you provided once access is granted.
          </p>
        </>
      )}
    </ModalShell>
  )
}

/* ── Bookmark component ──────────────────────────────── */

interface BookmarkProps {
  number: string
  name: string
  subtitle: string
  onClick: () => void
}

function Bookmark({ number, name, subtitle, onClick }: BookmarkProps) {
  return (
    <>
      <style>{`
        .bk-wrap {
          width: 110px;
          height: 200px;
          position: relative;
          cursor: pointer;
          padding: 18px 8px 24px;
          box-sizing: border-box;
          clip-path: polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%);
          background: linear-gradient(180deg, #faf8f3, #ebe7dc);
          border: 1px solid rgba(140,90,44,0.2);
          box-shadow: 0 6px 18px rgba(0,0,0,0.5);
          transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 250ms ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }
        .bk-wrap:hover {
          transform: translateY(-8px);
          box-shadow: 0 14px 28px rgba(0,0,0,0.6);
        }
        @keyframes tasselSway {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          33%       { transform: translateX(-50%) rotate(6deg); }
          66%       { transform: translateX(-50%) rotate(-4deg); }
        }
        .bk-wrap:hover .bk-tassel-thread,
        .bk-wrap:hover .bk-tassel-bunch {
          animation: tasselSway 600ms ease-in-out;
          transform-origin: top center;
        }
        @media (max-width: 768px) {
          .bk-wrap {
            width: 90px !important;
            height: 170px !important;
          }
          .bk-name {
            font-size: 12px !important;
          }
        }
      `}</style>
      <button
        className="bk-wrap"
        onClick={onClick}
        style={{ background: 'none', border: 'none', padding: 0 }}
      >
        {/* Re-apply bookmark styles via inline since button resets them */}
        <div style={{
          width: 110,
          height: 200,
          position: 'relative',
          cursor: 'pointer',
          padding: '18px 8px 24px',
          boxSizing: 'border-box',
          clipPath: 'polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)',
          background: 'linear-gradient(180deg, #faf8f3, #ebe7dc)',
          border: '1px solid rgba(140,90,44,0.2)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          {/* No. header */}
          <span style={{
            fontFamily: "'Times New Roman', serif",
            fontStyle: 'italic',
            fontSize: 9,
            color: '#4a3020',
            letterSpacing: 2,
            textAlign: 'center',
            display: 'block',
            whiteSpace: 'nowrap',
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
            {name}
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

          {/* Tassel thread */}
          <div
            className="bk-tassel-thread"
            style={{
              position: 'absolute',
              bottom: -22,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 1.5,
              height: 14,
              background: '#4a3020',
            }}
          />

          {/* Tassel bunch */}
          <div
            className="bk-tassel-bunch"
            style={{
              position: 'absolute',
              bottom: -36,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 18,
              height: 22,
              borderRadius: '0 0 50% 50% / 0 0 70% 70%',
              background: 'linear-gradient(180deg, #faf8f3, #4a3020)',
            }}
          />
        </div>
      </button>
    </>
  )
}

/* ── Parchment Letter ────────────────────────────────── */

interface ParchmentLetterProps {
  onLinkedIn:      () => void
  onContactInfo:   () => void
  onResume:        () => void
  onSchedule:      () => void
  onSendText:      () => void
}

function ParchmentLetter({
  onLinkedIn, onContactInfo, onResume, onSchedule, onSendText,
}: ParchmentLetterProps) {
  const [letterDate, setLetterDate] = useState('')

  useEffect(() => {
    setLetterDate(formatLetterDate(new Date()))
  }, [])

  const monoBody: React.CSSProperties = {
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 13,
    lineHeight: 1.9,
    color: '#2a1810',
  }

  return (
    <>
      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
        .bk-cursor {
          display: inline-block;
          width: 7px;
          height: 14px;
          background: #2a1810;
          vertical-align: middle;
          margin-left: 3px;
          animation: blink 1s step-end infinite;
        }
        @media (max-width: 768px) {
          .parchment-letter {
            padding: 30px 24px 70px !important;
            transform: rotate(0deg) !important;
          }
          .bk-row {
            gap: 10px !important;
          }
          .bk-row .bk-inner {
            width: 90px !important;
            height: 170px !important;
          }
          .bk-row .bk-name {
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
          fontFamily: "'Courier New', monospace",
          fontStyle: 'italic',
          fontSize: 11,
          color: '#5a3a20',
          textAlign: 'right',
          margin: '16px 0 24px',
        }}>
          {letterDate}
        </p>

        {/* Greeting */}
        <p style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 16,
          fontWeight: 700,
          color: '#2a1810',
          margin: '0 0 16px',
        }}>
          Dear visitor,
        </p>

        {/* Body */}
        <p style={{ ...monoBody, margin: '0 0 30px' }}>
          Thank you for stopping by. I appreciate your time,
          and if you&apos;d like to reach me, I&apos;ve prepared five
          bookmarks below. Pick whichever suits you best.
          <span className="bk-cursor" aria-hidden="true" />
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
          <BookmarkCard
            number="No. 01"
            name={'LINKEDIN'}
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
          — Hamza
        </p>
        <p style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 11,
          color: '#5a3a20',
          letterSpacing: 1,
          margin: 0,
        }}>
          CYBERSECURITY · GRC · A&amp;A
        </p>
      </div>
    </>
  )
}

/* ── Bookmark card (self-contained, hover handled via CSS class) ── */

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
    <div style={{ position: 'relative', flexShrink: 0 }}>
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

      {/* Tassel thread */}
      <div
        style={{
          position: 'absolute',
          bottom: -22,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1.5,
          height: 14,
          background: '#4a3020',
          animation: hovered ? 'tasselSway 600ms ease-in-out' : 'none',
          transformOrigin: 'top center',
        }}
      />

      {/* Tassel bunch */}
      <div
        style={{
          position: 'absolute',
          bottom: -36,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 18,
          height: 22,
          borderRadius: '0 0 50% 50% / 0 0 70% 70%',
          background: 'linear-gradient(180deg, #faf8f3, #4a3020)',
          animation: hovered ? 'tasselSway 600ms ease-in-out' : 'none',
          transformOrigin: 'top center',
        }}
      />

      <style>{`
        @keyframes tasselSway {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          33%       { transform: translateX(-50%) rotate(6deg); }
          66%       { transform: translateX(-50%) rotate(-4deg); }
        }
      `}</style>
    </div>
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
