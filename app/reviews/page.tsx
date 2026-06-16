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
    connection: 'Mentor',
    quote:      'Love the guy but he might just steal my job one of these days.',
  },
  {
    name:       'Hannah Schonfeld',
    initials:   'HS',
    slug:       'hannah-schonfeld',
    title:      'Program Manager',
    company:    'Triple Point Security (NIH Contract)',
    connection: 'Mentor',
    quote:      'One of the most reliable, organized, and driven professionals I\'ve had the pleasure of managing. His dedication, positive attitude, and ability to work effectively with others makes him a valuable asset to any team.',
  },
  {
    name:       'Kalie Eaton',
    initials:   'KE',
    slug:       'kalie-eaton',
    title:      'Senior Project Manager',
    company:    'Triple Point Security (NIH Contract)',
    connection: 'Colleague / Peer',
    quote:      'Derick might be right, I\'m lowkey scared myself.',
  },
  {
    name:       'Robert Wilkinson',
    initials:   'RW',
    slug:       'robert-wilkinson',
    title:      'Lead Security Compliance Analyst',
    company:    'Human Resources Technologies, Inc. / FedHIVE',
    connection: 'Direct Manager / Supervisor',
    quote:      'Thanks to Hamza\'s efforts, our organization has grown its security compliance footprint significantly. He has demonstrated the ability to simplify complex solutions down to pointed implementation statements pertaining to a broad array of security control families. I can confidently recommend Hamza Qureshi\'s application to your program.',
  },
  {
    name:       'Jacob Stroupe',
    initials:   'JS',
    slug:       'jacob-stroupe',
    title:      'Risk Advisory Manager',
    company:    'Baker Tilly US, LLP',
    connection: 'Direct Manager / Supervisor',
    quote:      'Hamza joined our risk advisory team in summer 2024 and was quickly entrusted with NIST CSF assessment work across multiple client engagements. He absorbed the framework, navigated complex internal control environments, and consistently produced deliverables that reflected a level of ownership well above his role. He was one of the most capable and talented interns I have had the privilege of coaching.',
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

/* ── Preview Letter Modal — reviewer-uploaded recommendation ────────────
   Mirrors the mentor LetterModal chrome (same outer overlay, same modal
   frame, same close button, same header layout) but renders the uploaded
   file inline. PDFs embed via <iframe>; other formats (.doc, .docx) can't
   be previewed inline by browsers, so we show a clean fallback with a
   Download button instead of a broken iframe. */

function isInlinePreviewable(url: string): boolean {
  const u = url.toLowerCase().split('?')[0]
  return u.endsWith('.pdf')
}

function ReviewLetterModal({ review, onClose }: { review: Review | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {review && review.recommendation_letter_url && (
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
            onWheel={e => e.stopPropagation()}
            data-lenis-prevent
            style={{
              background: '#0a0a0a',
              border: '1px solid rgba(200,168,124,0.25)',
              borderRadius: 12,
              maxWidth: 800, width: '92%',
              maxHeight: '90vh', overflowY: 'auto',
              overscrollBehavior: 'contain',
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
                zIndex: 1,
              }}
            >✕ CLOSE</button>

            {/* Header row — same shape as the mentor LetterModal header */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '2px solid rgba(200,168,124,0.3)',
                background: '#1a1a1a',
                flexShrink: 0, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {review.profile_picture_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.profile_picture_url}
                    alt={review.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
                    fontSize: 28, color: A,
                  }}>{initials(review.name)}</span>
                )}
              </div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
                  fontSize: 22, color: T, margin: '0 0 6px',
                }}>{review.name}</h3>
                <p style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: '0 0 2px' }}>
                  {review.profession} · {review.company}
                </p>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: A, margin: '0 0 8px' }}>
                  Connection: {review.connection}
                </p>
                <span style={{
                  color: '#FFC107', fontSize: 26, letterSpacing: 2,
                  textShadow: '0 0 8px rgba(255,193,7,0.4)',
                }}>
                  {'★'.repeat(Math.max(0, Math.min(5, review.rating)))}
                  {'☆'.repeat(Math.max(0, 5 - review.rating))}
                </span>
              </div>
            </div>

            {/* Letter body — iframe for PDFs, graceful fallback for Word docs */}
            {isInlinePreviewable(review.recommendation_letter_url) ? (
              <iframe
                src={review.recommendation_letter_url}
                title="Recommendation letter"
                style={{
                  width: '100%', height: '60vh',
                  border: '1px solid rgba(200,168,124,0.25)',
                  borderRadius: 8,
                  background: '#1a1410',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{
                padding: '40px 24px',
                border: '1px dashed rgba(200,168,124,0.35)',
                borderRadius: 8,
                background: 'rgba(200,168,124,0.04)',
                textAlign: 'center',
                fontFamily: 'Inter, sans-serif',
                color: '#e0e0e0',
                fontSize: 14,
                lineHeight: 1.7,
              }}>
                This file format (Word document) can&apos;t be previewed inline.
                <br />
                Use the button below to download and review it.
              </div>
            )}

            {/* Download button — opens the uploaded file in a new tab */}
            <button
              onClick={() => {
                playClickSound()
                window.open(review.recommendation_letter_url as string, '_blank')
              }}
              style={{
                marginTop: 24,
                fontFamily: 'monospace', fontSize: 11,
                border: '1px solid rgba(200,168,124,0.4)',
                color: A,
                background: 'rgba(200,168,124,0.05)',
                padding: '8px 20px', borderRadius: 4, cursor: 'pointer',
              }}
            >↓ Download Letter</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
            onWheel={e => e.stopPropagation()}
            data-lenis-prevent
            style={{
              background: '#0a0a0a',
              border: '1px solid rgba(200,168,124,0.25)',
              borderRadius: 12,
              maxWidth: 700, width: '90%',
              maxHeight: '85vh', overflowY: 'auto',
              overscrollBehavior: 'contain',
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
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: A, margin: '0 0 8px' }}>
                  Connection: {mentor.connection}
                </p>
                <FiveStars fontSize={26} />
              </div>
            </div>

            {/* Letter body — real content for those who have provided letters, placeholder otherwise */}
            {mentor.slug === 'robert-wilkinson' ? (
              <div style={{
                fontFamily: 'Inter, sans-serif', fontSize: 14,
                color: '#e0e0e0', lineHeight: 1.8,
                marginTop: 0,
              }}>
                <p style={{ marginTop: 0, marginBottom: 16 }}>
                  To Whom It May Concern,
                </p>
                <p style={{ marginBottom: 16 }}>
                  I am privileged to write this letter of recommendation for Hamza Qureshi, who was a valued contributor to our security compliance team here at FedHIVE. Hamza successfully prepared for and assisted in various comprehensive security framework assessments, including FedRAMP (NIST 800-53), Cybersecurity Maturity Model Certification (CMMC), Department of Defense (DoD) Impact Level 4 (IL4), and Impact Level 5 (IL5).
                </p>
                <p style={{ marginBottom: 16 }}>
                  Working within these high-impact environments required not only knowledge of each of the security frameworks but also the small nuances between them and the ability to operate with situational awareness to ensure that all control families, including Access Control, Configuration Management, System and Communications Protection, and Audit and Accountability, were thoroughly evaluated according to mission-critical confidentiality, integrity, and availability standards.
                </p>
                <p style={{ marginBottom: 16 }}>
                  As a cybersecurity analyst, he worked with system administrators to gain an understanding of various virtual environmental deployments, and the security parameters aligned based on those deployments with various security control requirements spread across multiple security frameworks. He has demonstrated the ability to simplify complex solutions down to pointed implementation statements pertaining to a broad array of security control families and developed a formalized template to create a repeatable process for all customer deployments our organization supports.
                </p>
                <p style={{ marginBottom: 16 }}>
                  Thanks to Hamza&apos;s efforts, our organization has grown its security compliance footprint significantly, which in turn has created additional opportunities to assist our customers by delivering secure cloud-based solutions. I can confidently recommend Hamza Qureshi&apos;s application to your program and am confident he will leverage his valuable experience and technical expertise to your organization.
                </p>
                <p style={{ marginBottom: 16 }}>
                  Sincerely,
                </p>
                <p style={{ marginBottom: 0 }}>
                  Robert Wilkinson<br />
                  Lead Security Compliance Analyst<br />
                  HRTec / FedHIVE
                </p>
              </div>
            ) : (
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 14,
                color: '#e0e0e0', lineHeight: 1.8,
                marginTop: 0,
              }}>
                {'// TODO — Paste full recommendation letter text here once received from this mentor'}
              </p>
            )}

            {/* Download button — real PDF for mentors who have provided one, graceful fallback otherwise */}
            <button
              onClick={() => {
                playClickSound()
                if (mentor.slug === 'robert-wilkinson') {
                  window.open('/letters/Robert_Wilkinson_Recommendation_Letter.pdf', '_blank')
                } else {
                  alert('Letter coming soon')
                }
              }}
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
    name: '', email: '', profession: '', company: '', connection: '', review: '',
  })
  const [selected,    setSelected]    = useState<Review | null>(null)
  const [letterModal, setLetterModal] = useState<Mentor | null>(null)
  // Separate from letterModal because the mentor modal renders a hard-coded
  // letter body, while review-letter previews need an iframe over the uploaded
  // file URL. Same modal chrome, different content area.
  const [reviewLetterModal, setReviewLetterModal] = useState<Review | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  // TODO — Upload picture to Supabase storage when implementing file upload backend integration
  const [picture,     setPicture]     = useState<File | null>(null)
  const [picturePreview, setPicturePreview] = useState<string | null>(null)
  // Optional recommendation letter the reviewer may attach. Uploaded to the
  // public Supabase Storage bucket "recommendation-letters" on submit; the
  // resulting public URL is saved on the review row + included in the admin
  // notification email.
  const [letterFile, setLetterFile] = useState<File | null>(null)

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

    let letterUrl: string | null = null
    let pictureUrl: string | null = null

    try {
      // Upload the recommendation letter FIRST so its public URL is ready
      // to persist on the review row. We only run this when the reviewer
      // actually attached a file — a no-file submission stays a pure insert.
      if (letterFile) {
        const fileExt = letterFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('recommendation-letters')
          .upload(fileName, letterFile, {
            contentType: letterFile.type,
            upsert: false,
          })

        if (uploadError) {
          console.error('[letter upload]', uploadError)
          alert('Failed to upload letter. Please try again or submit without the file.')
          setSubmitting(false)
          return
        }

        const { data: urlData } = supabase.storage
          .from('recommendation-letters')
          .getPublicUrl(fileName)

        letterUrl = urlData.publicUrl
      }

      // Upload the optional profile picture to a separate public bucket so
      // it can render as the testimonial-card avatar (replacing the initials
      // circle). Non-fatal: if the upload fails we keep the rest of the
      // submission going — initials are a fine fallback.
      if (picture) {
        const picExt = picture.name.split('.').pop()
        const picName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${picExt}`

        const { error: picUploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(picName, picture, {
            contentType: picture.type,
            upsert: false,
          })

        if (picUploadError) {
          console.error('[picture upload]', picUploadError)
          // Don't block the review — fall through with pictureUrl = null
        } else {
          const { data: picUrlData } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(picName)
          pictureUrl = picUrlData.publicUrl
        }
      }

      // Generate the row ID client-side. Avoids the .select() readback after
      // .insert(), which would be re-evaluated against the SELECT RLS policy
      // (`approved = true`) — that policy correctly hides pending rows from
      // the public, but it also blocked PostgREST from returning the just-
      // inserted row, surfacing as a misleading 42501 on submit. Sending the
      // pre-generated id in the body keeps the admin-email approve/reject
      // URLs intact without needing the readback.
      const newReviewId = crypto.randomUUID()

      const { error } = await supabase
        .from('reviews')
        .insert({
          id:                        newReviewId,
          name:                      form.name,
          reviewer_email:            form.email,
          profession:                form.profession,
          company:                   form.company,
          connection:                form.connection,
          rating,
          review_text:               form.review,
          approved:                  false,
          recommendation_letter_url: letterUrl,
          profile_picture_url:       pictureUrl,
        })
      if (error) {
        // Surface Supabase's actual diagnostic (column missing → 42703,
        // RLS denial → 42501, FK violation → 23503, etc.) so submission
        // failures point straight at the schema or policy that needs
        // attention. The full error stays in the console for debugging.
        console.error('[review submit] supabase insert error:', error)
        alert(`Submission failed: ${error.message}${error.code ? ` (code ${error.code})` : ''}`)
        setSubmitting(false)
        return
      }

      await fetch('/api/send-approval', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:         newReviewId,
          name:       form.name,
          email:      form.email,
          profession: form.profession,
          company:    form.company,
          connection: form.connection,
          rating,
          reviewText: form.review,
          letterUrl,
        }),
      })

      setSubmitted(true)
    } catch (err) {
      console.error('[review submit]', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-16 lg:px-24">
      {/* Page-scoped styles for the premium "Share Your Experience" CTA.
          Keyframes + button class live here so the page stays self-contained;
          reduced-motion override at the bottom keeps it accessible.
          dangerouslySetInnerHTML avoids React's text-node escaping, which
          would HTML-encode the single quotes inside the CSS and trigger a
          hydration mismatch with the server-rendered markup. */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes reviewBtnGlow {
          0%, 100% {
            box-shadow: 0 0 24px rgba(200,168,124,0.28),
                        0 6px 20px rgba(0,0,0,0.5);
          }
          50% {
            box-shadow: 0 0 44px rgba(200,168,124,0.55),
                        0 10px 28px rgba(0,0,0,0.6);
          }
        }
        @keyframes reviewBtnShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes reviewBtnBorder {
          0%, 100% { border-color: #c8a87c; }
          50%      { border-color: #ddc097; }
        }
        .review-cta-button {
          display: block;
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
          padding: 24px 32px;
          background: linear-gradient(90deg, rgba(26,26,26,0.95) 0%, rgba(42,36,24,0.95) 50%, rgba(26,26,26,0.95) 100%);
          background-size: 200% auto;
          color: #f5e8d4;
          border: 2px solid #c8a87c;
          border-radius: 12px;
          font-family: var(--font-space-grotesk), 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 0 24px rgba(200,168,124,0.28), 0 6px 20px rgba(0,0,0,0.5);
          animation:
            reviewBtnGlow 3.2s ease-in-out infinite,
            reviewBtnShimmer 5s linear infinite,
            reviewBtnBorder 4s ease-in-out infinite;
          transition:
            transform 350ms cubic-bezier(0.16, 1, 0.3, 1),
            background 350ms cubic-bezier(0.16, 1, 0.3, 1),
            color 350ms cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 350ms cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .review-cta-button:hover {
          transform: translateY(-4px);
          background: linear-gradient(90deg, #c8a87c 0%, #ddc097 50%, #c8a87c 100%);
          color: #0a0a0a;
          box-shadow: 0 0 50px rgba(200,168,124,0.7), 0 14px 32px rgba(0,0,0,0.6);
          animation-play-state: paused;
        }
        .review-cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(200,168,124,0.2), transparent);
          transition: left 800ms ease;
          pointer-events: none;
        }
        .review-cta-button:hover::before {
          left: 200%;
        }
        .review-cta-arrow {
          display: inline-block;
          margin-left: 12px;
          transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .review-cta-button:hover .review-cta-arrow {
          transform: translateX(8px);
        }
        @media (prefers-reduced-motion: reduce) {
          .review-cta-button {
            animation: none;
          }
          .review-cta-button:hover::before {
            transition: none;
          }
        }
      ` }} />
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
        {/* mb-6 (not mb-20) so the gap between the last mentor card and the
            first auto-approved review card matches the gap-6 between cards
            inside each section. Otherwise the section boundary reads as an
            inconsistent extra-large gap. */}
        <section id="recommendations" className="scroll-mt-24 mb-6">
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
                      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>

                        {/* Preview button + stars — absolutely positioned so they
                            don't expand the name row's height and push the title
                            block down. */}
                        <div style={{
                          position: 'absolute', top: 0, right: 0,
                          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
                        }}>
                          <button
                            onClick={e => { e.stopPropagation(); playClickSound(); setLetterModal(mentor) }}
                            style={{
                              fontFamily: 'monospace', fontSize: 10,
                              border: '1px solid rgba(200,168,124,0.4)',
                              color: A, background: 'transparent',
                              padding: '4px 12px', borderRadius: 4, cursor: 'pointer',
                            }}
                          >↗ Preview Recommendation Letter</button>
                          <FiveStars fontSize={26} />
                        </div>

                        {/* Name */}
                        <h3 style={{
                          fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
                          fontSize: 18, color: T, margin: '0 0 4px',
                          paddingRight: 220,
                        }}>{mentor.name}</h3>

                        {/* Title */}
                        <p style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: '0 0 2px' }}>
                          {mentor.title}
                        </p>

                        {/* Company */}
                        <p style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: '0 0 4px' }}>
                          {mentor.company}
                        </p>

                        {/* Connection */}
                        <p style={{ fontFamily: 'monospace', fontSize: 11, color: A, margin: 0 }}>
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

          {/* Approved reviews — render with the EXACT same card structure as
              the featured mentor cards above so a freshly approved review and
              a hand-curated recommendation look indistinguishable. The only
              dynamic differences are the rating star count and whether the
              reviewer uploaded a recommendation letter. */}
          {!loading && reviews.length > 0 && (
            <div className="flex flex-col gap-6 mb-16">
              {reviews.map((r, i) => {
                // Strip any stray leading/trailing straight quotes the
                // reviewer typed (e.g. `"Hamza is..."`) so the rendered
                // &ldquo;...&rdquo; doesn't double up to `""...""`.
                const cleanQuote = (r.review_text || '').replace(/^["']+|["']+$/g, '').trim()
                return (
                  <motion.div key={r.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(i * 0.08)}>
                    <div
                      style={{ position: 'relative', cursor: 'pointer' }}
                      onClick={() => setSelected(r)}
                      onMouseEnter={() => setHoveredCard(r.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Hover hint arrow — matches the mentor card */}
                      <span style={{
                        position: 'absolute', top: 14, right: 16, zIndex: 2,
                        fontFamily: 'monospace', fontSize: 11, color: 'rgba(200,168,124,0.5)',
                        opacity: hoveredCard === r.id ? 1 : 0,
                        transition: 'opacity 0.2s', pointerEvents: 'none',
                      }}>↗</span>

                      <GlassCard static>
                        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

                          {/* Profile picture — reviewer upload if provided,
                              initials fallback otherwise. 72px circle with
                              taupe border, matching the mentor avatars. */}
                          <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            border: '2px solid rgba(200,168,124,0.3)',
                            background: '#1a1a1a',
                            flexShrink: 0, overflow: 'hidden',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {r.profile_picture_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={r.profile_picture_url}
                                alt={r.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{
                                fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
                                fontSize: 24, color: A,
                              }}>{initials(r.name)}</span>
                            )}
                          </div>

                          {/* Content column */}
                          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>

                            {/* Absolute right column: optional Preview Letter
                                button + stars — same positioning as mentor. */}
                            <div style={{
                              position: 'absolute', top: 0, right: 0,
                              display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
                            }}>
                              {r.recommendation_letter_url && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    playClickSound()
                                    setReviewLetterModal(r)
                                  }}
                                  style={{
                                    fontFamily: 'monospace', fontSize: 10,
                                    border: '1px solid rgba(200,168,124,0.4)',
                                    color: A, background: 'transparent',
                                    padding: '4px 12px', borderRadius: 4, cursor: 'pointer',
                                  }}
                                >↗ Preview Recommendation Letter</button>
                              )}
                              {/* Variable star block — same gold + glow look
                                  as FiveStars, filled to match the rating. */}
                              <span style={{
                                color: '#FFC107', fontSize: 26, letterSpacing: 2,
                                textShadow: '0 0 8px rgba(255,193,7,0.4)',
                              }}>
                                {'★'.repeat(Math.max(0, Math.min(5, r.rating)))}
                                {'☆'.repeat(Math.max(0, 5 - r.rating))}
                              </span>
                            </div>

                            {/* Name */}
                            <h3 style={{
                              fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
                              fontSize: 18, color: T, margin: '0 0 4px',
                              paddingRight: 220,
                            }}>{r.name}</h3>

                            {/* Profession */}
                            <p style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: '0 0 2px' }}>
                              {r.profession}
                            </p>

                            {/* Company */}
                            <p style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: '0 0 4px' }}>
                              {r.company}
                            </p>

                            {/* Connection */}
                            <p style={{ fontFamily: 'monospace', fontSize: 11, color: A, margin: 0 }}>
                              Connection: {r.connection}
                            </p>

                            {/* Quote */}
                            <p style={{
                              fontFamily: 'Inter, sans-serif', fontSize: 14,
                              color: '#e0e0e0', lineHeight: 1.7,
                              marginTop: 16, fontStyle: 'italic',
                            }}>
                              &ldquo;{cleanQuote}&rdquo;
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Hook copy + Leave a Review CTA */}
          {!showForm && !submitted && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
              transition={trans(0.1)}
              style={{ marginTop: 60, textAlign: 'center' }}
            >
              {/* Hook copy */}
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: 'rgba(245,232,212,0.75)',
                  maxWidth: 720,
                  margin: '0 auto 40px auto',
                  textAlign: 'center',
                  padding: '0 24px',
                }}
              >
                The portfolio shows what I have done, but the reviews tell people what it is actually like to work with me. Every review on this page is from someone who took the time to put their experience into a few sentences. If I made an impact or worked with you in any capacity, I would be honored to add your voice to that list. Looking forward to hearing your thoughts.
              </p>

              {/* Premium animated review CTA */}
              <button
                onClick={() => { playClickSound(); setShowForm(true) }}
                className="review-cta-button"
              >
                Share Your Experience With Hamza By Leaving A Review
                <span className="review-cta-arrow">→</span>
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
                      <label className="font-mono text-xs block mb-1.5 tracking-widest" style={{ color: TM }}>EMAIL ADDRESS *</label>
                      <input required type="email" placeholder="your@email.com" style={inputStyle}
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
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
                    {/* Optional recommendation letter — drag-and-drop with type +
                        size validation. File gets uploaded to Supabase Storage
                        on submit; admin email gets a download link. */}
                    <div>
                      <label className="font-mono text-xs block mb-1.5 tracking-widest" style={{ color: TM }}>RECOMMENDATION LETTER (OPTIONAL)</label>
                      <div
                        onClick={() => document.getElementById('letter-file-input')?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                        onDrop={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const file = e.dataTransfer.files?.[0]
                          if (file) {
                            const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                            if (!allowed.includes(file.type)) {
                              alert('Only PDF, DOC, or DOCX files are accepted.')
                              return
                            }
                            if (file.size > 10 * 1024 * 1024) {
                              alert('File must be 10MB or less.')
                              return
                            }
                            setLetterFile(file)
                          }
                        }}
                        style={{
                          background: 'rgba(200,168,124,0.05)',
                          border: '2px dashed rgba(200,168,124,0.35)',
                          borderRadius: 8,
                          padding: '24px 16px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 200ms ease',
                          fontFamily: 'monospace',
                          fontSize: 13,
                          color: 'rgba(245,232,212,0.6)',
                        }}
                      >
                        {letterFile ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <span style={{ color: '#c8a87c' }}>
                              ↑ {letterFile.name} · {(letterFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setLetterFile(null) }}
                              style={{
                                background: 'transparent',
                                border: '1px solid rgba(200,168,124,0.35)',
                                color: '#c8a87c',
                                padding: '4px 10px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontFamily: 'monospace',
                                fontSize: 11,
                              }}
                            >
                              REMOVE
                            </button>
                          </div>
                        ) : (
                          <span>Click or drag a file to upload (.pdf, .doc, .docx · max 10MB)</span>
                        )}
                      </div>
                      <input
                        id="letter-file-input"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              alert('File must be 10MB or less.')
                              return
                            }
                            setLetterFile(file)
                          }
                        }}
                      />
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
                      Thank you for sharing your experience!
                    </p>
                    <p className="font-mono text-sm" style={{ color: T, lineHeight: 1.7 }}>
                      Your review will be posted here once approved. You&apos;ll receive an email confirmation as soon as it goes live.
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

      {/* ── Auto-uploaded reviewer letter modal ──────────────────────────── */}
      <ReviewLetterModal review={reviewLetterModal} onClose={() => setReviewLetterModal(null)} />
    </div>
  )
}
