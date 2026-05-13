'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0  },
}

// TODO #5 — Replace all placeholder values with your actual experience entries
const experiences = [
  {
    title:    'Job Title Here',
    company:  'Company Name',
    period:   'Month YYYY – Present',
    location: 'City, State (Remote / On-site)',
    bullets: [
      'Placeholder bullet point describing a key responsibility or achievement in this role.',
      'Placeholder bullet point describing another key responsibility, process, or tool you used.',
      'Placeholder bullet point describing measurable impact, metrics, or outcomes you delivered.',
    ],
    tags: ['Tag One', 'Tag Two', 'Tag Three'],
  },
  {
    title:    'Previous Job Title',
    company:  'Previous Company',
    period:   'Month YYYY – Month YYYY',
    location: 'City, State',
    bullets: [
      'Placeholder bullet point describing a key responsibility or achievement.',
      'Placeholder bullet point describing another responsibility, tool, or framework used.',
      'Placeholder bullet point describing metrics or impact.',
    ],
    tags: ['Tag One', 'Tag Two'],
  },
  {
    title:    'Earlier Job Title',
    company:  'Earlier Company',
    period:   'Month YYYY – Month YYYY',
    location: 'City, State',
    bullets: [
      'Placeholder bullet point describing a key responsibility or achievement.',
      'Placeholder bullet point describing responsibilities in this role.',
    ],
    tags: ['Tag One', 'Tag Two', 'Tag Three'],
  },
  {
    title:    'First Role / Internship',
    company:  'First Company / Organization',
    period:   'Month YYYY – Month YYYY',
    location: 'City, State',
    bullets: [
      'Placeholder bullet point describing your earliest relevant experience.',
      'Placeholder bullet point describing responsibilities or key learning.',
    ],
    tags: ['Tag One'],
  },
]

export default function Experience() {
  return (
    <div className="py-24 px-6 md:px-12 lg:px-24 bg-white/[0.01]">
      <div className="max-w-4xl mx-auto">

        {/* Section tag */}
        <motion.p
          className="font-mono text-teal/50 text-xs tracking-[0.2em] mb-2"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5 }}
        >
          &lt;experience /&gt;
        </motion.p>

        <motion.h2
          className="font-heading text-4xl md:text-5xl font-bold mb-16"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          Experience
        </motion.h2>

        {/* Timeline */}
        <div className="relative ml-4">
          {/* Vertical line */}
          <div className="absolute left-0 top-3 bottom-3 w-px bg-teal/20" />

          {experiences.map((exp, i) => (
            <motion.div
              key={i}
              className="relative pl-10 mb-10 group"
              variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              {/* Timeline dot */}
              <div
                className="absolute -left-[5px] top-7 w-2.5 h-2.5 rounded-full bg-teal transition-all duration-300 group-hover:shadow-[0_0_14px_#00ffe0]"
                style={{ boxShadow: '0 0 6px rgba(0,255,224,0.45)' }}
              />

              <GlassCard>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-white leading-tight">
                      {exp.title}
                    </h3>
                    <p className="font-mono text-teal text-sm mt-0.5">{exp.company}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-white/40 text-xs">{exp.period}</p>
                    <p className="font-mono text-white/25 text-xs mt-0.5">{exp.location}</p>
                  </div>
                </div>

                {/* Bullets */}
                <ul className="space-y-2 mb-5">
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} className="flex gap-2.5 text-white/60 text-sm leading-relaxed">
                      <span className="text-teal/50 mt-[3px] shrink-0">›</span>
                      {bullet}
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs border border-teal/20 text-teal/65 px-2.5 py-0.5 rounded"
                      style={{ background: 'rgba(0,255,224,0.04)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
