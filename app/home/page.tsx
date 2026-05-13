'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const A  = '#c8a87c'
const T  = '#f0f0f0'
const TM = '#666677'

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }
const vp     = { once: true, margin: '-60px' }
const trans  = (delay = 0) => ({ duration: 0.6, ease: 'easeOut' as const, delay })

export default function HomePage() {
  const [showRing, setShowRing] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowRing(true), 80)
    return () => clearTimeout(t1)
  }, [])

  return (
    <>
      {/* ── White overlay — bridges vault white flash ── */}
      <motion.div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, background: '#ffffff', zIndex: 8000, pointerEvents: 'none' }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
      />

      {/* ── Shockwave ring ── */}
      {showRing && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 0, height: 0,
            borderRadius: '50%',
            border: '2px solid rgba(200,168,124,0.3)',
            zIndex: 7999,
            pointerEvents: 'none',
            animation: 'shockwave-ring 800ms ease-out forwards',
          }}
        />
      )}

      {/* ── Page — 100vh, no scroll ── */}
      <motion.div
        style={{
          height: '100vh',
          overflow: 'hidden',
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      >
        {/* ══ TOP SECTION — two columns ══════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: 60,
          padding: '90px 80px 40px 80px',
          alignItems: 'flex-start',
          flexShrink: 0,
          maxHeight: 'calc(100vh - 55vh)',
          overflow: 'hidden',
        }}>
          {/* ── LEFT: Name / tagline ── */}
          <div>
            <motion.h1
              style={{
                fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
                fontSize: 52, color: T,
                lineHeight: 1.08, margin: '0 0 16px',
              }}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.08)}>
              Hamza{' '}
              <span style={{ color: '#c8a87c' }}>Qureshi.</span>
            </motion.h1>

            {/* Thin rule */}
            <motion.div
              style={{ width: 60, height: 1, background: 'rgba(200,168,124,0.4)', margin: '0 0 16px' }}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.14)}
            />

            {/* ── Rotating roles — pure CSS, no hydration risk ── */}
            <style>{`
              @keyframes roleSlide {
                0%,   6%   { transform: translateY(0);     }
                7.6%, 13.6%  { transform: translateY(-32px);  }
                15.4%, 21.4% { transform: translateY(-64px);  }
                23.1%, 29.1% { transform: translateY(-96px);  }
                30.8%, 36.8% { transform: translateY(-128px); }
                38.5%, 44.5% { transform: translateY(-160px); }
                46.2%, 52.2% { transform: translateY(-192px); }
                53.9%, 59.9% { transform: translateY(-224px); }
                61.6%, 67.6% { transform: translateY(-256px); }
                69.3%, 75.3% { transform: translateY(-288px); }
                77%,   83%   { transform: translateY(-320px); }
                84.7%, 90.7% { transform: translateY(-352px); }
                92.4%, 98.4% { transform: translateY(-384px); }
                100%         { transform: translateY(-416px); }
              }
              .roles-track {
                animation: roleSlide 23.4s ease-in-out infinite;
              }
            `}</style>
            <motion.div
              style={{ height: 32, overflow: 'hidden', position: 'relative' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="roles-track">
                {[
                  'Senior Cybersecurity Consultant',
                  'Governance, Risk & Compliance Analyst',
                  'Assessment & Authorization (A&A) Analyst',
                  'Federal Compliance Specialist',
                  'Cybersecurity Risk Consultant',
                  'Cybersecurity Project Manager',
                  'FedRAMP Compliance Analyst',
                  'CMMC Compliance Specialist',
                  'Cloud Security Compliance Analyst',
                  'Information Assurance Analyst',
                  'Zero Trust Compliance Analyst',
                  'IT Systems Auditor',
                  'IT SOX Analyst',
                  'Senior Cybersecurity Consultant', /* duplicate for seamless loop */
                ].map((role, i) => (
                  <div key={i} style={{
                    height: 32, lineHeight: '32px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 18,
                    color: '#c8a87c',
                    letterSpacing: 0.3,
                    whiteSpace: 'nowrap',
                  }}>
                    {role}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Welcome pull-quote ── */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', alignSelf: 'center' }}>

            {/* Decorative quote mark — left of text */}
            <span aria-hidden="true" style={{
              fontFamily:    "'Times New Roman', serif",
              fontSize:      64,
              color:         '#ffffff',
              lineHeight:    1,
              opacity:       0.5,
              flexShrink:    0,
              userSelect:    'none',
              pointerEvents: 'none',
              marginTop:     -8,
            }}>&ldquo;</span>

            {/* Text block */}
            <div>
              {/* Paragraph 1 */}
              <motion.p
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontStyle:  'italic',
                  fontSize:   15,
                  color:      '#f5e8d4',
                  lineHeight: 1.65,
                  margin:     '0 0 16px',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              >
                Welcome to the professional journey of Hamza Qureshi.
              </motion.p>

              {/* Paragraph 2 */}
              <motion.p
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontStyle:  'italic',
                  fontSize:   15,
                  color:      '#f5e8d4',
                  lineHeight: 1.65,
                  margin:     '0 0 16px',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.7 }}
              >
                Because you deserve more than a boring resume, this portfolio offers professionals
                and industry peers a transparent, in-depth view of who I am as a cybersecurity
                professional, the impact I&apos;ve made, and the value I bring to the field.
              </motion.p>

              {/* Paragraph 3 */}
              <motion.p
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontStyle:  'italic',
                  fontSize:   15,
                  color:      '#f5e8d4',
                  lineHeight: 1.65,
                  margin:     0,
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 1.2 }}
              >
                Use the navigation bar above to explore my portfolio.
              </motion.p>
            </div>
          </div>
        </div>

        {/* ══ BOTTOM SECTION — full-width photo banner ═══════════════════ */}
        <motion.div
          style={{
            width: '100%',
            height: '60vh',
            overflow: 'hidden',
            position: 'relative',
            display: 'block',
          }}
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={vp} transition={trans(0.3)}>

          {/* Photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/profile-photo.jpg"
            alt="Hamza Qureshi"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 20%',
              display: 'block',
            }}
          />

          {/* Top fade — dark top section bleeds into photo */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 80,
            background: 'linear-gradient(to bottom, #000000, transparent)',
            pointerEvents: 'none',
          }} />

          {/* Bottom fade — photo fades to black */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: 80,
            background: 'linear-gradient(to top, #000000, transparent)',
            pointerEvents: 'none',
          }} />
        </motion.div>
      </motion.div>
    </>
  )
}
