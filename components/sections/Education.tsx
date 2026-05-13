'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0  },
}

// TODO #7 — Replace all placeholder values with your actual education entries
const education = [
  {
    institution: 'University Name Here',
    degree:      'Bachelor of Science / Master of Science',
    field:       'Your Field of Study',
    years:       'YYYY – YYYY',
    honors:      'Summa Cum Laude / GPA X.XX / Dean\'s List', // leave empty string '' to hide
  },
  {
    institution: 'Second Institution Here',
    degree:      'Degree or Certificate Program',
    field:       'Your Field of Study',
    years:       'YYYY – YYYY',
    honors:      '',
  },
  {
    institution: 'Third Institution / Bootcamp',
    degree:      'Professional Certificate',
    field:       'Area of Study',
    years:       'YYYY',
    honors:      '',
  },
]

export default function Education() {
  return (
    <div className="py-24 px-6 md:px-12 lg:px-24 bg-white/[0.01]">
      <div className="max-w-6xl mx-auto">

        {/* Section tag */}
        <motion.p
          className="font-mono text-teal/50 text-xs tracking-[0.2em] mb-2"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5 }}
        >
          &lt;education /&gt;
        </motion.p>

        <motion.h2
          className="font-heading text-4xl md:text-5xl font-bold mb-12"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          Education
        </motion.h2>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {education.map((edu, i) => (
            <motion.div
              key={i}
              variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col">
                {/* Institution logo placeholder */}
                <div
                  className="w-12 h-12 rounded-lg border border-teal/20 flex items-center justify-center mb-5 shrink-0"
                  style={{ background: 'rgba(0,255,224,0.04)' }}
                >
                  <span className="font-heading font-bold text-teal text-xl leading-none">
                    {edu.institution.charAt(0)}
                  </span>
                  {/* TODO #7 — Replace with <Image src="logo.png" alt="..." width={32} height={32} /> */}
                </div>

                <h3 className="font-heading text-base font-semibold text-white mb-1 leading-snug">
                  {edu.institution}
                </h3>
                <p className="font-mono text-teal text-sm mb-0.5">{edu.degree}</p>
                <p className="text-white/50 text-sm mb-2">{edu.field}</p>
                <p className="font-mono text-white/30 text-xs mb-4">{edu.years}</p>

                {edu.honors && (
                  <div
                    className="border border-violet/25 rounded px-3 py-1.5 inline-block mt-auto"
                    style={{ background: 'rgba(123,94,167,0.08)' }}
                  >
                    <span className="font-mono text-violet/80 text-xs">{edu.honors}</span>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
