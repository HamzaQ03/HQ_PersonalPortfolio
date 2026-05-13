'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0  },
}

// TODO #8 — Replace all placeholder values with your actual certifications
const activeCerts = [
  { name: 'Certification Name', issuer: 'Issuing Body', year: 'YYYY' },
  { name: 'Certification Name', issuer: 'Issuing Body', year: 'YYYY' },
  { name: 'Certification Name', issuer: 'Issuing Body', year: 'YYYY' },
  { name: 'Certification Name', issuer: 'Issuing Body', year: 'YYYY' },
]

const inProgressCerts = [
  { name: 'In-Progress Cert Name', issuer: 'Issuing Body', expected: 'Expected Q? YYYY' },
  { name: 'In-Progress Cert Name', issuer: 'Issuing Body', expected: 'Expected Q? YYYY' },
]

export default function Learning() {
  return (
    <div className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">

        {/* Section tag */}
        <motion.p
          className="font-mono text-teal/50 text-xs tracking-[0.2em] mb-2"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5 }}
        >
          &lt;learning /&gt;
        </motion.p>

        <motion.h2
          className="font-heading text-4xl md:text-5xl font-bold mb-12"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          Learning & Certifications
        </motion.h2>

        {/* ── Active Certifications ── */}
        <motion.div
          className="mb-14"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="font-mono text-teal/55 text-xs tracking-[0.2em] mb-6">
            {'// ACTIVE CERTIFICATIONS'}
          </p>

          <div className="flex flex-wrap gap-4">
            {activeCerts.map((cert, i) => (
              <motion.div
                key={i}
                className="border border-teal/20 rounded-xl px-5 py-4 group cursor-default"
                style={{ background: 'rgba(0,255,224,0.04)' }}
                whileHover={{
                  borderColor: 'rgba(0,255,224,0.45)',
                  boxShadow: '0 0 22px rgba(0,255,224,0.12)',
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {/* Active dot */}
                  <span
                    className="w-2 h-2 rounded-full bg-teal shrink-0"
                    style={{ boxShadow: '0 0 6px #00ffe0' }}
                  />
                  <span className="font-heading font-semibold text-white text-sm group-hover:text-teal transition-colors duration-200">
                    {cert.name}
                  </span>
                </div>
                <p className="font-mono text-white/35 text-xs">{cert.issuer}</p>
                <p className="font-mono text-teal/45 text-xs mt-0.5">{cert.year}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── In Progress ── */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="font-mono text-amber-400/55 text-xs tracking-[0.2em] mb-6">
            {'// IN PROGRESS'}
          </p>

          <div className="flex flex-wrap gap-4">
            {inProgressCerts.map((cert, i) => (
              <div
                key={i}
                className="border border-amber-400/20 rounded-xl px-5 py-4"
                style={{ background: 'rgba(251,191,36,0.04)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {/* Pulsing amber dot */}
                  <span className="relative w-2 h-2 shrink-0">
                    <span
                      className="absolute inset-0 rounded-full bg-amber-400"
                      style={{ boxShadow: '0 0 6px rgba(251,191,36,0.8)' }}
                    />
                    <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
                  </span>
                  <span className="font-heading font-semibold text-white text-sm">{cert.name}</span>
                </div>
                <p className="font-mono text-white/35 text-xs mb-2">{cert.issuer}</p>
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-amber-400 text-[10px] border border-amber-400/30 px-1.5 py-0.5 rounded tracking-wide"
                    style={{ background: 'rgba(251,191,36,0.07)' }}
                  >
                    IN PROGRESS
                  </span>
                  <span className="font-mono text-white/25 text-xs">{cert.expected}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
