'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import CertLogo from '@/components/CertLogo'
import { playClickSound } from '@/lib/sound'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const vp = { once: true, margin: '-60px' }
const trans = (d = 0) => ({ duration: 0.6, ease: 'easeOut' as const, delay: d })

const A  = '#c8a87c'
const T  = '#f0f0f0'
const TM = '#666677'

/* ── Data ─────────────────────────────────────────────── */

const activeCerts: {
  name: string
  code: string | null
  issuer: string
  period: string
  pdfUrl: string | null
  description: string
}[] = [
  {
    name:   'CompTIA Security+',
    code:   'SY0-701',
    issuer: 'CompTIA',
    period: 'May 2026 – Present',
    pdfUrl: '/Certificates/CompTIA%20Security%2B%20ce%20certificate%20-%20HQ%20-%20Certificate.pdf',
    description: `Graduating with a cybersecurity concentration was never going to be the end of my learning curve. After two years building federal compliance programs across FedRAMP, CMMC, and RMF, I realized I was assessing technical controls every day without the deep technical fluency that sits underneath them. Security+ was my answer. I pursued the certification to get my hands dirty with the core security principles I had been operating around but not always operating in, including threat detection and response, cryptography, identity and access management, network security, and risk management. Passing SY0-701 closed the gap between the compliance lens I work through professionally and the technical foundation that makes that work credible, and gave me a sharper perspective when reviewing the controls and architectures I assess in my day to day GRC and A&A engagements.`,
  },
  {
    name:   'AWS Solutions Architect',
    code:   'SAA-C03',
    issuer: 'Amazon Web Services (AWS)',
    period: 'February 2026 – Present',
    pdfUrl: '/Certificates/AWS%20Certified%20Solutions%20Architect%20-%20HQ-%20Certificate.pdf',
    description: `Every FedRAMP package I worked on at FedHIVE involved AWS in some form, but I was always reading about it secondhand through Customer Responsibility Matrices and shared responsibility documentation. I wanted to understand AWS the way the engineers building on it understand it. The SAA-C03 was my entry point into that world, forcing me to learn how the platform actually scales, how its services interconnect, how its security model is structured from IAM upward, and how architectural decisions translate into real cost, performance, and security tradeoffs. Passing the exam gave me the technical grounding to engage cloud engineers as a peer when discussing control inheritance, shared responsibility, and FedRAMP authorized service usage, and laid the foundation for the multi cloud expertise I am building toward across AWS, Azure, and GCP.`,
  },
  {
    name:   'Microsoft Azure Administrator',
    code:   'AZ-104',
    issuer: 'Microsoft',
    period: 'April 2026 – Present',
    pdfUrl: '/Certificates/AZZURE-104-HQ-Certificate.pdf',
    description: `After AWS, the obvious next move was to break my single cloud thinking. Real federal environments rarely live on just one cloud, and the compliance work I do increasingly spans hybrid and multi cloud deployments where the controls implemented on AWS look meaningfully different from the same controls implemented on Azure. The AZ-104 pushed me into Microsoft's ecosystem on its own terms, teaching me how Entra ID handles identity, how virtual networks and storage are structured, how Azure Policy enforces governance, and how administrators secure and operate large environments at scale. Passing the exam gave me the second pillar of a multi cloud foundation and reinforced something I now apply constantly in my A&A work, which is that the same NIST control can produce very different evidence depending on which cloud platform you are assessing.`,
  },
  {
    name:    'Google Project Management Professional Certificate',
    code:    null,
    issuer:  'Google',
    period:  'June 2026 – Present',
    pdfUrl:  null,
    description: `Cybersecurity programs do not deliver themselves. The further I moved into senior GRC and A&A work, the more I saw that the analysts who get programs across the finish line are the ones who can run them like project managers, not just execute them like contributors. I pursued the Google Project Management certification as the structured foundation for that skill set and as my first formal step toward the PMI Project Management Professional (PMP) credential. The program covered project initiation, planning, execution, monitoring and controlling, and closing across both traditional and agile methodologies, and gave me the framework I now apply to managing JCAM rollouts, ISCM strategy implementation, and IT modernization deliverables. It also gave me the contact hours and theoretical grounding needed to prepare for the PMP exam, which is my next certification target.`,
  },
]

const inProgressCerts = [
  {
    name:     'Project Management Professional',
    code:     'PMP',
    issuer:   'Project Management Institute (PMI)',
    expected: 'August 2026',
  },
  {
    name:     'Certified Information Systems Auditor',
    code:     'CISA',
    issuer:   'ISACA',
    expected: 'November 2026',
  },
  {
    name:     'Certified Information Security Manager',
    code:     'CISM',
    issuer:   'ISACA',
    expected: 'February 2027',
  },
  {
    name:     'Certified Cloud Security Professional',
    code:     'CCSP',
    issuer:   'ISC²',
    expected: 'May 2027',
  },
]

type ModalData =
  | { kind: 'clearance' }
  | { kind: 'active';     index: number }
  | { kind: 'inprogress'; index: number }

/* ── Badge helpers ───────────────────────────────────── */

function ActiveBadge({ label }: { label: string }) {
  return (
    <span style={{
      fontFamily: 'monospace', fontSize: 10, letterSpacing: 1,
      padding: '3px 10px', borderRadius: 4,
      background: 'rgba(34,197,94,0.1)',
      border: '1px solid rgba(34,197,94,0.3)',
      color: '#22c55e',
    }}>
      {label}
    </span>
  )
}

function InProgressBadge() {
  return (
    <span style={{
      fontFamily: 'monospace', fontSize: 10, letterSpacing: 1,
      padding: '3px 10px', borderRadius: 4,
      background: 'rgba(234,179,8,0.1)',
      border: '1px solid rgba(234,179,8,0.3)',
      color: '#eab308',
    }}>
      IN PROGRESS
    </span>
  )
}

/* ── Modal ───────────────────────────────────────────── */

function CertModal({
  data,
  onClose,
  onPdfPreview,
}: {
  data: ModalData | null
  onClose: () => void
  onPdfPreview: (url: string, name: string) => void
}) {
  return (
    <AnimatePresence>
      {data && (
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
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '96px 24px 24px 24px',
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
              maxWidth: 560,
              width: '90%',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
              padding: 28,
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
            >
              ✕ CLOSE
            </button>

            {/* Clearance modal */}
            {data.kind === 'clearance' && (
              <div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <CertLogo certName="Public Trust Clearance" issuer="National Institutes of Health (NIH)" size={56} />
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 12 }}><ActiveBadge label="ACTIVE" /></div>
                    <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 20, color: T, margin: '0 0 8px' }}>
                      Public Trust Clearance
                    </h3>
                    <p style={{ fontFamily: 'monospace', fontSize: 12, color: TM, margin: '0 0 10px' }}>
                      Tier 2 — Background Investigation
                    </p>
                    <p style={{ fontFamily: 'monospace', fontSize: 12, color: TM, margin: '0 0 6px' }}>
                      Issuing Agency: National Institutes of Health (NIH) / U.S. Department of Health and Human Services (HHS)
                    </p>
                    <p style={{ fontFamily: 'monospace', fontSize: 12, color: TM, margin: '0 0 16px' }}>
                      Period: September 2025 – Present
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: TM, lineHeight: 1.7, margin: 0 }}>
                      Federal background investigation completed and adjudicated by the issuing agency.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Active cert modal */}
            {data.kind === 'active' && (() => {
              const c = activeCerts[data.index]
              return (
                <div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <CertLogo certName={c.name} issuer={c.issuer} size={56} />
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 12 }}><ActiveBadge label="COMPLETED" /></div>
                      <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 20, color: T, margin: '0 0 8px' }}>
                        {c.name}
                      </h3>
                      <p className="cert-meta-line" style={{ fontFamily: 'monospace', fontSize: 12, color: A, margin: '0 0 16px' }}>
                        {c.code ? `Code: ${c.code} · ` : ''}Issuer: {c.issuer} · Period: {c.period}
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: T, lineHeight: 1.7, margin: '0 0 20px' }}>
                        {c.description}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (c.pdfUrl) {
                            onPdfPreview(c.pdfUrl, c.name)
                          } else {
                            alert('Certificate coming soon')
                          }
                        }}
                        style={{
                          fontFamily: 'monospace', fontSize: 10, letterSpacing: 1,
                          border: '1px solid rgba(200,168,124,0.4)', color: A,
                          padding: '4px 12px', borderRadius: 4, cursor: 'pointer',
                          background: 'transparent',
                        }}
                      >
                        ↓ Preview Certificate
                      </button>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* In-progress cert modal */}
            {data.kind === 'inprogress' && (() => {
              const c = inProgressCerts[data.index]
              return (
                <div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <CertLogo certName={c.name} issuer={c.issuer} size={56} />
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 12 }}><InProgressBadge /></div>
                      <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 20, color: T, margin: '0 0 8px' }}>
                        {c.name}
                      </h3>
                      <p className="cert-meta-line" style={{ fontFamily: 'monospace', fontSize: 12, color: TM, margin: '0 0 16px' }}>
                        Code: {c.code} · Issuer: {c.issuer} · Expected Completion: {c.expected}
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: TM, lineHeight: 1.7, margin: 0 }}>
                        Currently preparing for this certification. Expected completion date is subject to change.
                      </p>
                    </div>
                  </div>
                </div>
              )
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Page ────────────────────────────────────────────── */

export default function CertificationsPage() {
  const [modal, setModal]       = useState<ModalData | null>(null)
  const [pdfModal, setPdfModal] = useState<{ url: string; name: string } | null>(null)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  useEffect(() => {
    if (!pdfModal) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPdfModal(null)
    }

    document.addEventListener('keydown', onKey)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [pdfModal])

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto">

        {/* Page heading — CHANGE 1: tag above removed */}
        <motion.h2 className="font-heading text-4xl md:text-5xl font-bold mb-16"
          style={{ color: T }}
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.1)}>
          Certifications &amp; Clearances
        </motion.h2>

        {/* ── SECTION 1 — Security Clearance ──────────────── */}
        <section id="clearance" className="scroll-mt-24 mb-16">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.2)}>
            {/* CHANGE 2: bold header, no // */}
            <p className="font-mono mb-6" style={{ fontWeight: 'bold', fontSize: 16, color: T, letterSpacing: 2 }}>
              SECURITY CLEARANCE
            </p>
            {/* CHANGE 5: clickable wrapper, no card styling change */}
            <div
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => setModal({ kind: 'clearance' })}
              onMouseEnter={() => { setHoveredCard('clearance'); window.dispatchEvent(new Event('certifications:cardEntered')) }}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <span style={{
                position: 'absolute', top: 14, right: 16, zIndex: 2,
                fontFamily: 'monospace', fontSize: 11, color: 'rgba(200,168,124,0.5)',
                opacity: hoveredCard === 'clearance' ? 1 : 0,
                transition: 'opacity 0.2s', pointerEvents: 'none',
              }}>↗</span>
              <GlassCard static>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <CertLogo certName="Public Trust Clearance" issuer="National Institutes of Health (NIH)" size={40} />
                  <div style={{ flex: 1 }}>
                    {/* Title row */}
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                      <h3 className="font-heading font-bold text-base" style={{ color: T }}>
                        Public Trust Clearance
                      </h3>
                      <ActiveBadge label="ACTIVE" />
                    </div>
                    {/* Details row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-mono text-xs" style={{ color: A }}>
                        Tier 2 — Background Investigation
                      </span>
                      <span style={{ color: 'rgba(200,168,124,0.3)', fontFamily: 'monospace', fontSize: 10 }}>|</span>
                      <span className="font-mono text-xs" style={{ color: '#ffffff' }}>
                        National Institutes of Health (NIH) / U.S. Department of Health and Human Services (HHS)
                      </span>
                      <span style={{ color: 'rgba(200,168,124,0.3)', fontFamily: 'monospace', fontSize: 10 }}>|</span>
                      <span className="font-mono text-xs" style={{ color: A }}>
                        September 2025 – Present
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </section>

        {/* ── SECTION 2 — Active Certifications ───────────── */}
        <section id="active-certifications" className="scroll-mt-24 mb-16">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.25)}>
            {/* CHANGE 2: bold header, no // */}
            <p className="font-mono mb-6" style={{ fontWeight: 'bold', fontSize: 16, color: T, letterSpacing: 2 }}>
              ACTIVE CERTIFICATIONS
            </p>
            <div className="flex flex-col gap-4">
              {activeCerts.map((c, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(i * 0.07)}>
                  {/* CHANGE 5: clickable wrapper */}
                  <div
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => setModal({ kind: 'active', index: i })}
                    onMouseEnter={() => { setHoveredCard(`active-${i}`); window.dispatchEvent(new Event('certifications:cardEntered')) }}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <span style={{
                      position: 'absolute', top: 14, right: 16, zIndex: 2,
                      fontFamily: 'monospace', fontSize: 11, color: 'rgba(200,168,124,0.5)',
                      opacity: hoveredCard === `active-${i}` ? 1 : 0,
                      transition: 'opacity 0.2s', pointerEvents: 'none',
                    }}>↗</span>
                    <GlassCard static>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <CertLogo certName={c.name} issuer={c.issuer} size={40} />
                        <div style={{ flex: 1 }}>
                          {/* Top row: name + download button + badge (all inline, mirrors in-progress layout) */}
                          <div className="cert-card-header flex items-center justify-between gap-3 mb-2">
                            <h3 className="font-heading font-semibold text-sm flex-1" style={{ color: T }}>
                              {c.name}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexShrink: 0, gap: 8 }}>
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  if (c.pdfUrl) {
                                    setPdfModal({ url: c.pdfUrl, name: c.name })
                                  } else {
                                    alert('Certificate coming soon')
                                  }
                                }}
                                style={{
                                  fontFamily: 'monospace', fontSize: 10, letterSpacing: 1,
                                  border: '1px solid rgba(200,168,124,0.4)', color: A,
                                  padding: '4px 12px', borderRadius: 4, cursor: 'pointer',
                                  background: 'transparent',
                                }}
                              >
                                ↓ Preview Certificate
                              </button>
                              <span style={{
                                display: 'inline-block',
                                fontFamily: 'monospace', fontSize: 9, letterSpacing: 2,
                                padding: '3px 10px', borderRadius: 4,
                                background: 'rgba(34,197,94,0.1)',
                                border: '1px solid rgba(34,197,94,0.3)',
                                color: '#22c55e',
                              }}>COMPLETED</span>
                            </div>
                          </div>

                          {/* CHANGE 4: single-line details */}
                          <p className="cert-meta-line font-mono text-xs" style={{ color: A, margin: 0 }}>
                            {c.code ? `Code: ${c.code} · ` : ''}Issuer: {c.issuer} · Period: {c.period}
                          </p>

                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── SECTION 3 — In Progress ──────────────────────── */}
        <section id="in-progress" className="scroll-mt-24">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.3)}>
            {/* CHANGE 2: bold header, no // */}
            <p className="font-mono mb-6" style={{ fontWeight: 'bold', fontSize: 16, color: T, letterSpacing: 2 }}>
              IN PROGRESS CERTIFICATIONS
            </p>
            <div className="flex flex-col gap-4">
              {inProgressCerts.map((c, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(i * 0.07)}>
                  {/* CHANGE 5: clickable wrapper */}
                  <div
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => setModal({ kind: 'inprogress', index: i })}
                    onMouseEnter={() => { setHoveredCard(`ip-${i}`); window.dispatchEvent(new Event('certifications:cardEntered')) }}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <span style={{
                      position: 'absolute', top: 14, right: 16, zIndex: 2,
                      fontFamily: 'monospace', fontSize: 11, color: 'rgba(200,168,124,0.5)',
                      opacity: hoveredCard === `ip-${i}` ? 1 : 0,
                      transition: 'opacity 0.2s', pointerEvents: 'none',
                    }}>↗</span>
                    <GlassCard static>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <CertLogo certName={c.name} issuer={c.issuer} size={40} />
                        <div style={{ flex: 1 }}>
                          {/* Top row: pulsing dot + name + IN PROGRESS badge */}
                          <div className="flex items-center gap-3 mb-2">
                            <span className="relative w-2 h-2 shrink-0">
                              <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(234,179,8,0.4)' }} />
                              <span className="absolute inset-0 rounded-full" style={{ background: '#eab308', boxShadow: '0 0 6px rgba(234,179,8,0.8)' }} />
                            </span>
                            <h3 className="font-heading font-semibold text-sm flex-1" style={{ color: T }}>
                              {c.name}
                            </h3>
                            <span style={{
                              display: 'inline-block',
                              fontFamily: 'monospace', fontSize: 9, letterSpacing: 2,
                              padding: '3px 10px', borderRadius: 4,
                              background: 'rgba(234,179,8,0.1)',
                              border: '1px solid rgba(234,179,8,0.3)',
                              color: '#eab308',
                              flexShrink: 0,
                            }}>IN PROGRESS</span>
                          </div>

                          {/* CHANGE 4: single-line details */}
                          <p className="cert-meta-line font-mono text-xs" style={{ color: A, margin: 0 }}>
                            Code: {c.code} · Issuer: {c.issuer} · Expected Completion: {c.expected}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

      </div>

      {/* Modal */}
      <CertModal
        data={modal}
        onClose={() => setModal(null)}
        onPdfPreview={(url, name) => setPdfModal({ url, name })}
      />

      {/* In-page PDF preview modal */}
      {pdfModal && (
        <div
          onClick={() => setPdfModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '96px 24px 24px 24px',
            animation: 'pdfModalFadeIn 200ms ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 1100,
              height: 'calc(100vh - 120px)',
              maxHeight: '88vh',
              background: '#0a0a0a',
              border: '2px solid #c8a87c',
              borderRadius: 8,
              boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(200,168,124,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal header bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid rgba(200,168,124,0.25)',
              background: 'linear-gradient(180deg, rgba(200,168,124,0.08), transparent)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: 10,
                  letterSpacing: 1.5,
                  color: '#c8a87c',
                  opacity: 0.7,
                }}>
                  CERTIFICATE PREVIEW
                </span>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: 10,
                  color: 'rgba(200,168,124,0.3)',
                }}>
                  ·
                </span>
                <span style={{
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#f5e8d4',
                }}>
                  {pdfModal.name}
                </span>
              </div>
              <button
                onClick={() => setPdfModal(null)}
                aria-label="Close certificate preview"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(200,168,124,0.4)',
                  color: '#c8a87c',
                  padding: '6px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  letterSpacing: 1,
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(200,168,124,0.1)'
                  e.currentTarget.style.borderColor = '#c8a87c'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(200,168,124,0.4)'
                }}
              >
                × CLOSE
              </button>
            </div>

            {/* PDF iframe */}
            <iframe
              src={pdfModal.url}
              title={`${pdfModal.name} certificate preview`}
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
                background: '#1a1a1a',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
