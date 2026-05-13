'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0  },
}

// TODO #9 — Replace all placeholder values with your actual mentor/colleague reviews
const reviews = [
  {
    name:     'Reviewer Full Name',
    role:     'Title / Role at Company',
    initials: 'RF',
    quote:    'Placeholder testimonial quote from your mentor or colleague. Describe the value you bring, specific skills, or professional qualities they observed while working with you.',
    stars:    5,
  },
  {
    name:     'Reviewer Full Name',
    role:     'Title / Role at Company',
    initials: 'RF',
    quote:    'Placeholder testimonial quote from your mentor or colleague. Describe the value you bring, specific skills, or professional qualities they observed while working with you.',
    stars:    5,
  },
  {
    name:     'Reviewer Full Name',
    role:     'Title / Role at Company',
    initials: 'RF',
    quote:    'Placeholder testimonial quote from your mentor or colleague. Describe the value you bring, specific skills, or professional qualities they observed while working with you.',
    stars:    5,
  },
]

export default function Mentors() {
  return (
    <div className="py-24 px-6 md:px-12 lg:px-24 bg-white/[0.01]">
      <div className="max-w-6xl mx-auto">

        {/* Section tag */}
        <motion.p
          className="font-mono text-teal/50 text-xs tracking-[0.2em] mb-2"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5 }}
        >
          &lt;mentors /&gt;
        </motion.p>

        <motion.h2
          className="font-heading text-4xl md:text-5xl font-bold mb-12"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          Mentor Reviews
        </motion.h2>

        {/* Horizontal scroll row */}
        <motion.div
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,255,224,0.3) transparent' }}
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
        >
          {reviews.map((review, i) => (
            <div
              key={i}
              className="snap-start shrink-0 w-[320px] md:w-[400px]"
            >
              <GlassCard className="h-full flex flex-col" static>
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: review.stars }).map((_, j) => (
                    <span key={j} className="text-teal text-base" style={{ textShadow: '0 0 8px #00ffe0' }}>
                      ★
                    </span>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-white/60 text-sm leading-relaxed flex-1 italic mb-6">
                  &ldquo;{review.quote}&rdquo;
                </p>

                {/* Reviewer */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                  <div
                    className="w-10 h-10 rounded-full border border-teal/25 flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(0,255,224,0.07)' }}
                  >
                    <span className="font-heading font-bold text-teal text-xs">{review.initials}</span>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-white text-sm">{review.name}</p>
                    <p className="font-mono text-white/35 text-xs">{review.role}</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  )
}
