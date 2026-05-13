'use client'
import { useState } from 'react'
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

const activeCerts = [
  {
    name:   'CompTIA Security+',
    code:   'SY0-701',
    issuer: 'CompTIA',
    period: 'May 2026 – Present',
  },
  {
    name:   'AWS Solutions Architect',
    code:   'SAA-C03',
    issuer: 'Amazon Web Services (AWS)',
    period: 'February 2026 – Present',
  },
  {
    name:   'Microsoft Azure Administrator',
    code:   'AZ-104',
    issuer: 'Microsoft',
    period: 'April 2026 – Present',
  },
]

const inProgressCerts = [
  {
    name:     'Certified Information Systems Auditor',
    code:     'CISA',
    issuer:   'ISACA',
    expected: 'August 2026',
  },
  {
    name:     'Certified Information Security Manager',
    code:     'CISM',
    issuer:   'ISACA',
    expected: 'December 2026',
  },
  {
    name:     'Certified Cloud Security Professional',
    code:     'CCSP',
    issuer:   'ISC²',
    expected: 'April 2027',
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

function CertModal({ data, onClose }: { data: ModalData | null; onClose: () => void }) {
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
              maxWidth: 560,
              width: '90%',
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
                      <p style={{ fontFamily: 'monospace', fontSize: 12, color: TM, margin: '0 0 16px' }}>
                        Code: {c.code} · Issuer: {c.issuer} · Period: {c.period}
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: TM, lineHeight: 1.7, margin: '0 0 20px' }}>
                        {'// TODO — Write your personal description here: Describe why you pursued this certification, what you learned during the process, and how you apply these skills in your GRC and A&A work professionally.'}
                      </p>
                      {/* TODO — Replace alert with: window.open('/certificates/CERTNAME.pdf', '_blank') */}
                      <button
                        onClick={() => alert('Certificate coming soon')}
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
                      <p style={{ fontFamily: 'monospace', fontSize: 12, color: TM, margin: '0 0 16px' }}>
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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

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
              onMouseEnter={() => setHoveredCard('clearance')}
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
        <section id="active-certs" className="scroll-mt-24 mb-16">
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
                    onMouseEnter={() => setHoveredCard(`active-${i}`)}
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
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <h3 className="font-heading font-semibold text-sm flex-1" style={{ color: T }}>
                              {c.name}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexShrink: 0, gap: 8 }}>
                              {/* TODO — Replace alert with: window.open('/certificates/CERTNAME.pdf', '_blank') */}
                              <button
                                onClick={e => { e.stopPropagation(); alert('Certificate coming soon') }}
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
                          <p className="font-mono text-xs" style={{ color: A, margin: 0 }}>
                            Code: {c.code} · Issuer: {c.issuer} · Period: {c.period}
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
                    onMouseEnter={() => setHoveredCard(`ip-${i}`)}
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
                          <p className="font-mono text-xs" style={{ color: A, margin: 0 }}>
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
      <CertModal data={modal} onClose={() => setModal(null)} />
    </div>
  )
}
