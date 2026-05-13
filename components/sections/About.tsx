'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0  },
}

// TODO #4 — Fill in your actual stats
const stats = [
  { value: 'X+',  label: 'Years Experience' },
  { value: 'XX',  label: 'Frameworks'       },
  { value: 'TBD', label: 'Clearance Level'  },
]

export default function About() {
  return (
    <div className="py-24 px-6 md:px-12 lg:px-24 min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto w-full">

        {/* Section tag */}
        <motion.p
          className="font-mono text-teal/50 text-xs tracking-[0.2em] mb-2"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5 }}
        >
          &lt;about /&gt;
        </motion.p>

        <motion.h2
          className="font-heading text-4xl md:text-5xl font-bold mb-12"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          About Me
        </motion.h2>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: text + stats ── */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard>
              {/* Tagline */}
              <p className="font-mono text-teal text-sm mb-5 tracking-wide">
                {/* TODO #3 — Add your tagline */}
                {`> "Your tagline goes here."`}
              </p>

              {/* Bio line 1 */}
              <p className="text-white/65 text-base leading-relaxed mb-3">
                {/* TODO #3 — Add your bio line 1 */}
                First line of your professional bio goes here. Describe your background, area of specialization, and what drives you.
              </p>

              {/* Bio line 2 */}
              <p className="text-white/65 text-base leading-relaxed">
                {/* TODO #3 — Add your bio line 2 */}
                Second line of your bio goes here. Mention key skills, industries, or goals that define your career path.
              </p>

              {/* Stat badges */}
              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="border border-teal/20 rounded-lg px-5 py-3 text-center"
                    style={{ background: 'rgba(0,255,224,0.04)' }}
                  >
                    <div className="font-heading font-bold text-2xl text-teal leading-none mb-1">
                      {stat.value}
                    </div>
                    <div className="font-mono text-white/45 text-xs tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* ── Right: avatar ── */}
          <motion.div
            className="flex justify-center"
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.35 }}
          >
            <div className="relative">
              {/* Outer pulse ring */}
              <motion.div
                className="absolute -inset-4 rounded-full border border-teal/10"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Avatar circle */}
              <div
                className="relative w-56 h-56 md:w-64 md:h-64 rounded-full border-2 border-teal flex items-center justify-center overflow-hidden"
                style={{ boxShadow: '0 0 40px rgba(0,255,224,0.18), 0 0 80px rgba(0,255,224,0.07)' }}
              >
                <div className="w-full h-full rounded-full bg-white/[0.03] flex flex-col items-center justify-center gap-2">
                  {/* TODO: Replace this block with <Image src="..." alt="..." fill className="object-cover" /> */}
                  <div className="font-mono text-teal/30 text-[10px] text-center leading-relaxed px-6">
                    AVATAR_PLACEHOLDER
                    <br />
                    <span className="text-white/15">Replace with your photo</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
