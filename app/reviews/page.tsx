'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import GlassCard from '@/components/ui/GlassCard'
import Modal from '@/components/ui/Modal'
import { playClickSound } from '@/lib/sound'
import { supabase } from '@/lib/supabase'
import type { Review } from '@/lib/supabase'

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }
const vp = { once: true, margin: '-60px' }
const trans = (d = 0) => ({ duration: 0.6, ease: 'easeOut' as const, delay: d })

const A  = '#c8a87c'
const T  = '#f0f0f0'
const TM = '#666677'
const TD = '#333340'

const CONNECTION_OPTIONS = [
  'Direct Manager / Supervisor',
  'Colleague / Peer',
  'Mentee',
  'Client / Stakeholder',
  'Academic Advisor',
  'Other Professional Contact',
]

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function StarRating({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1 items-center">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => { if (onChange) { playClickSound(); onChange(n) } }}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{
            color: n <= (hover || value) ? A : TD,
            textShadow: n <= (hover || value) ? `0 0 8px ${A}` : 'none',
            fontSize: '1.25rem', background: 'none', border: 'none',
            cursor: onChange ? 'none' : 'default',
          }}
        >★</button>
      ))}
      {onChange && <span className="font-mono text-xs ml-2" style={{ color: TM }}>{value}/5</span>}
    </div>
  )
}

const inputStyle = {
  background: '#000000',
  border: '1px solid #1c1c1c',
  borderRadius: 8,
  color: T,
  padding: '0.625rem 1rem',
  width: '100%',
  fontSize: '0.875rem',
  outline: 'none',
} as const

/* ── Mentor data ─────────────────────────────────────── */

const MENTORS = [
  {
    name:       'Derick Sogbor',
    initials:   'DS',
    slug:       'derick-sogbor',
    title:      'Senior Project Manager',
    company:    'Triple Point Security (NIH Contract)',
    connection: '// TODO — Add relationship type',
    quote:      '// TODO — Add quote or highlight from recommendation letter once received',
  },
  {
    name:       'Hannah Schonfeld',
    initials:   'HS',
    slug:       'hannah-schonfeld',
    title:      'Program Manager',
    company:    'Triple Point Security (NIH Contract)',
    connection: '// TODO — Add relationship type',
    quote:      '// TODO — Add quote or highlight from recommendation letter once received',
  },
  {
    name:       'Kalie Eaton',
    initials:   'KE',
    slug:       'kalie-eaton',
    title:      'Senior Project Manager',
    company:    'Triple Point Security (NIH Contract)',
    connection: '// TODO — Add relationship type',
    quote:      '// TODO — Add quote or highlight from recommendation letter once received',
  },
  {
    name:       'Robert Wilkinson',
    initials:   'RW',
    slug:       'robert-wilkinson',
    title:      'Lead Security Compliance Analyst',
    company:    'Human Resources Technologies, Inc. / FedHIVE',
    connection: '// TODO — Add relationship type',
    quote:      '// TODO — Add quote or highlight from recommendation letter once received',
  },
  {
    name:       'Jacob Stroupe',
    initials:   'JS',
    slug:       'jacob-stroupe',
    title:      'Risk Advisory Manager',
    company:    'Baker Tilly US, LLP',
    connection: '// TODO — Add relationship type',
    quote:      '// TODO — Add quote or highlight from recommendation letter once received',
  },
]

type Mentor = typeof MENTORS[0]

/* ── Profile picture with initials fallback ──────────── */

function ProfilePic({ mentor, size = 72 }: { mentor: Mentor; size?: number }) {
  const [imgError, setImgError] = useState(false)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: '2px solid rgba(200,168,124,0.3)',
      background: '#1a1a1a',
      flexShrink: 0, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      {!imgError ? (
        <Image
          src={`/mentors/${mentor.slug}.jpg`}
          alt={mentor.name}
          fill
          style={{ objectFit: 'cover' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span style={{
          fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
          fontSize: size === 80 ? 28 : 24, color: A,
        }}>{mentor.initials}</span>
      )}
    </div>
  )
}

/* ── Five static gold stars ──────────────────────────── */

function FiveStars({ fontSize = 14 }: { fontSize?: number }) {
  return (
    <span style={{ color: '#FFC107', fontSize, letterSpacing: 2, textShadow: '0 0 8px rgba(255,193,7,0.4)' }}>★★★★★</span>
  )
}

/* ── Preview Letter Modal ────────────────────────────── */

function LetterModal({ mentor, onClose }: { mentor: Mentor | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {mentor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.78)',
            zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0a0a0a',
              border: '1px solid rgba(200,168,124,0.25)',
              borderRadius: 12,
              maxWidth: 700, width: '90%',
              maxHeight: '85vh', overflowY: 'auto',
              padding: 32,
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => { playClickSound(); onClose() }}
              style={{
                position: 'absolute', top: 16, right: 16,
                fontFamily: 'monospace', fontSize: 10,
                color: 'rgba(200,168,124,0.7)',
                border: '1px solid rgba(200,168,124,0.3)',
                background: 'transparent',
                padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
              }}
            >✕ CLOSE</button>

            {/* Header row */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24 }}>
              <ProfilePic mentor={mentor} size={80} />
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
                  fontSize: 22, color: T, margin: '0 0 6px',
                }}>{mentor.name}</h3>
                <p style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: '0 0 2px' }}>
                  {mentor.title} · {mentor.company}
                </p>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: TM, margin: '0 0 8px' }}>
                  Connection: {mentor.connection}
                </p>
                <FiveStars fontSize={26} />
              </div>
            </div>

            {/* Letter body placeholder */}
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 14,
              color: '#e0e0e0', lineHeight: 1.8,
              marginTop: 0,
            }}>
              {'// TODO — Paste full recommendation letter text here once received from this mentor'}
            </p>

            {/* Download button */}
            {/* TODO — Replace alert with: window.open('/letters/MENTORNAME.pdf', '_blank') */}
            <button
              onClick={() => { playClickSound(); alert('Letter coming soon') }}
              style={{
                marginTop: 24,
                fontFamily: 'monospace', fontSize: 11,
                border: '1px solid rgba(200,168,124,0.4)',
                color: A,
                background: 'rgba(200,168,124,0.05)',
                padding: '8px 20px', borderRadius: 4, cursor: 'pointer',
              }}
            >↓ Download Letter (PDF)</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Page ────────────────────────────────────────────── */

export default function ReviewsPage() {
  const [reviews,     setReviews]     = useState<Review[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [rating,      setRating]      = useState(0)
  const [form, setForm] = useState({
    name: '', profession: '', company: '', connection: '', review: '',
  })
  const [selected,    setSelected]    = useState<Review | null>(null)
  const [letterModal, setLetterModal] = useState<Mentor | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  // TODO — Upload picture to Supabase storage when implementing file upload backend integration
  const [picture,     setPicture]     = useState<File | null>(null)
  const [picturePreview, setPicturePreview] = useState<string | null>(null)

  // ── Fetch approved reviews on mount ─────────────────────────────────────
  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })
      if (data) setReviews(data)
      setLoading(false)
    }
    fetchReviews()
  }, [])

  // ── Submit review ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          name:        form.name,
          profession:  form.profession,
          company:     form.company,
          connection:  form.connection,
          rating,
          review_text: form.review,
          approved:    false,
        })
        .select()
        .single()
      if (error) throw error
      await fetch('/api/send-approval', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:         data.id,
          name:       form.name,
          profession: form.profession,
          company:    form.company,
          connection: form.connection,
          rating,
          reviewText: form.review,
        }),
      })
      setSubmitted(true)
    } catch (err) {
      console.error('[review submit]', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto">

        {/* Page heading */}
        <motion.h2
          className="font-heading font-bold mb-16"
          style={{ color: T, fontSize: 'clamp(24px, 3.5vw, 40px)', whiteSpace: 'nowrap' }}
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.08)}
        >
          Reviews and Recommendation Letters
        </motion.h2>

        {/* ── SECTION 1 — Featured Recommendations ────────── */}
        <section id="recommendations" className="scroll-mt-24 mb-20">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.12)}>
            <p className="font-mono mb-8" style={{ fontWeight: 'bold', fontSize: 16, color: T, letterSpacing: 2 }}>
              FEATURED RECOMMENDATIONS
            </p>
          </motion.div>

          <div className="flex flex-col gap-6">
            {MENTORS.map((mentor, i) => (
              <motion.div
                key={mentor.slug}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.14 + i * 0.07)}
              >
                <div
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => setLetterModal(mentor)}
                  onMouseEnter={() => setHoveredCard(mentor.slug)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Hover hint */}
                  <span style={{
                    position: 'absolute', top: 14, right: 16, zIndex: 2,
                    fontFamily: 'monospace', fontSize: 11, color: 'rgba(200,168,124,0.5)',
                    opacity: hoveredCard === mentor.slug ? 1 : 0,
                    transition: 'opacity 0.2s', pointerEvents: 'none',
                  }}>↗</span>

                  <GlassCard static>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

                      {/* Profile picture */}
                      <ProfilePic mentor={mentor} size={72} />

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>

                        {/* Top row: name + preview button */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                          <h3 style={{
                            fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
                            fontSize: 18, color: T, margin: 0,
                          }}>{mentor.name}</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                            {/* Preview button */}
                            <button
                              onClick={e => { e.stopPropagation(); playClickSound(); setLetterModal(mentor) }}
                              style={{
                                fontFamily: 'monospace', fontSize: 10,
                                border: '1px solid rgba(200,168,124,0.4)',
                                color: A, background: 'transparent',
                                padding: '4px 12px', borderRadius: 4, cursor: 'pointer',
                              }}
                            >↗ Preview Recommendation Letter</button>
                            {/* Stars */}
                            <FiveStars fontSize={26} />
                          </div>
                        </div>

                        {/* Title */}
                        <p style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: '0 0 2px' }}>
                          {mentor.title}
                        </p>

                        {/* Company */}
                        <p style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: '0 0 4px' }}>
                          {mentor.company}
                        </p>

                        {/* Connection */}
                        <p style={{ fontFamily: 'monospace', fontSize: 11, color: TM, margin: 0 }}>
                          Connection: {mentor.connection}
                        </p>

                        {/* Quote */}
                        <p style={{
                          fontFamily: 'Inter, sans-serif', fontSize: 14,
                          color: '#e0e0e0', lineHeight: 1.7,
                          marginTop: 16, fontStyle: 'italic',
                        }}>
                          &ldquo;{mentor.quote}&rdquo;
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── SECTION 2 — Public Reviews ───────────────────── */}
        <section id="testimonials" className="scroll-mt-24">

          {/* Approved reviews — show when present, no header, no empty state */}
          {!loading && reviews.length > 0 && (
            <div className="flex flex-col gap-6 mb-16">
              {reviews.map((r, i) => (
                <motion.div key={r.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(i * 0.08)}>
                  <GlassCard expandable onClick={() => setSelected(r)}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full border flex items-center justify-center shrink-0"
                        style={{ borderColor: 'rgba(200,168,124,0.25)', background: 'rgba(200,168,124,0.07)' }}>
                        <span className="font-heading font-bold text-sm" style={{ color: A }}>{initials(r.name)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-heading font-semibold text-sm" style={{ color: T }}>{r.name}</p>
                        <p className="font-mono text-xs" style={{ color: TM }}>{r.profession} · {r.company}</p>
                        <p className="font-mono text-[10px] mt-0.5 px-2 py-0.5 rounded border inline-block"
                          style={{ color: 'rgba(200,168,124,0.6)', borderColor: 'rgba(200,168,124,0.2)', background: 'rgba(200,168,124,0.04)' }}>
                          {r.connection}
                        </p>
                      </div>
                      <StarRating value={r.rating} />
                    </div>
                    <p className="text-sm leading-relaxed italic pt-4" style={{ color: TM, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      &ldquo;{r.review_text}&rdquo;
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Leave a Review button */}
          {!showForm && !submitted && (
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.1)}>
              <button
                onClick={() => { playClickSound(); setShowForm(true) }}
                className="font-mono text-sm px-8 py-3 rounded-lg border transition-all duration-300"
                style={{ color: A, borderColor: 'rgba(200,168,124,0.35)', background: 'transparent', boxShadow: '0 0 14px rgba(200,168,124,0.08)' }}
              >
                [ LEAVE A REVIEW ]
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">

            {/* Review form */}
            {showForm && !submitted && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mt-8"
              >
                <GlassCard static>
                  <h3 className="font-heading text-lg font-semibold mb-6" style={{ color: T }}>Leave a Review</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="font-mono text-xs block mb-1.5 tracking-widest" style={{ color: TM }}>FULL NAME *</label>
                      <input required type="text" placeholder="Your full name" style={inputStyle}
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="font-mono text-xs block mb-1.5 tracking-widest" style={{ color: TM }}>PROFESSION / JOB TITLE *</label>
                      <input required type="text" placeholder="e.g. Senior Engineer" style={inputStyle}
                        value={form.profession} onChange={e => setForm(f => ({ ...f, profession: e.target.value }))} />
                    </div>
                    <div>
                      <label className="font-mono text-xs block mb-1.5 tracking-widest" style={{ color: TM }}>COMPANY / ORGANIZATION *</label>
                      <input required type="text" placeholder="Company name" style={inputStyle}
                        value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                    </div>
                    <div>
                      <label className="font-mono text-xs block mb-1.5 tracking-widest" style={{ color: TM }}>YOUR CONNECTION *</label>
                      <select required style={{ ...inputStyle, appearance: 'none' as const }}
                        value={form.connection} onChange={e => setForm(f => ({ ...f, connection: e.target.value }))}>
                        <option value="" disabled>Select your relationship</option>
                        {CONNECTION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="font-mono text-xs block mb-1 tracking-widest" style={{ color: TM }}>UPLOAD PICTURE</label>
                      <span className="font-mono block mb-1.5" style={{ fontSize: 10, color: TM }}>(Optional)</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{
                          background: '#000000',
                          border: '1px solid rgba(200,168,124,0.25)',
                          color: '#e0e0e0',
                          fontFamily: 'monospace',
                          fontSize: 12,
                          padding: '10px 12px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          width: '100%',
                          outline: 'none',
                        }}
                        onChange={e => {
                          const file = e.target.files?.[0] ?? null
                          setPicture(file)
                          if (file) {
                            const url = URL.createObjectURL(file)
                            setPicturePreview(url)
                          } else {
                            setPicturePreview(null)
                          }
                        }}
                      />
                      {picturePreview && (
                        <div style={{ marginTop: 10 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={picturePreview}
                            alt="Preview"
                            style={{
                              width: 60, height: 60, borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1px solid rgba(200,168,124,0.25)',
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="font-mono text-xs block mb-2 tracking-widest" style={{ color: TM }}>OVERALL RATING *</label>
                      <StarRating value={rating} onChange={setRating} />
                    </div>
                    <div>
                      <label className="font-mono text-xs block mb-1.5 tracking-widest" style={{ color: TM }}>YOUR REVIEW *</label>
                      <textarea required rows={5} placeholder="Share your experience..."
                        style={{ ...inputStyle, resize: 'none', minHeight: 120 }}
                        value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))} />
                    </div>
                    <button
                      type="submit"
                      onClick={playClickSound}
                      disabled={submitting || rating === 0}
                      className="w-full font-mono text-sm py-3 rounded-lg transition-all duration-300"
                      style={{
                        color: '#000000', background: submitting ? '#666677' : '#c8a87c',
                        border: 'none', opacity: rating === 0 ? 0.5 : 1,
                      }}
                    >
                      {submitting ? '[ SUBMITTING... ]' : '[ SUBMIT REVIEW ]'}
                    </button>
                  </form>
                </GlassCard>
              </motion.div>
            )}

            {/* Thank you message */}
            {submitted && (
              <motion.div
                key="thankyou"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="mt-8"
              >
                <GlassCard static>
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <p className="font-mono text-sm mb-3" style={{ color: A }}>
                      {'// THANK YOU'}
                    </p>
                    <p className="font-mono text-sm" style={{ color: TM, lineHeight: 1.7 }}>
                      Thank you for your review!<br />
                      It will appear on this page once approved.
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )}

          </AnimatePresence>
        </section>
      </div>

      {/* ── Review detail modal (public reviews) ────────────────────────── */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div>
            <div className="flex gap-1 mb-4">
              {Array.from({ length: selected.rating }).map((_, j) => (
                <span key={j} style={{ color: A, textShadow: `0 0 8px ${A}`, fontSize: '1.1rem' }}>★</span>
              ))}
              {Array.from({ length: 5 - selected.rating }).map((_, j) => (
                <span key={j} style={{ color: TD, fontSize: '1.1rem' }}>★</span>
              ))}
              <span className="font-mono text-xs ml-2 self-center" style={{ color: TM }}>{selected.rating}/5</span>
            </div>
            <p className="text-sm leading-relaxed italic mb-6" style={{ color: TM }}>&ldquo;{selected.review_text}&rdquo;</p>
            <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0"
                style={{ borderColor: 'rgba(200,168,124,0.25)', background: 'rgba(200,168,124,0.07)' }}>
                <span className="font-heading font-bold text-xs" style={{ color: A }}>{initials(selected.name)}</span>
              </div>
              <div>
                <p className="font-heading font-semibold text-sm" style={{ color: T }}>{selected.name}</p>
                <p className="font-mono text-xs" style={{ color: TM }}>{selected.profession} · {selected.company}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Recommendation letter modal ──────────────────────────────────── */}
      <LetterModal mentor={letterModal} onClose={() => setLetterModal(null)} />
    </div>
  )
}
