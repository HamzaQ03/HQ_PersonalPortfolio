'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0  },
}

// TODO #6 — Replace all placeholder values with your actual project entries
const projects = [
  {
    name:        'Project Name One',
    description: 'Brief description of this project. What problem does it solve? What technologies, frameworks, or methodologies are involved?',
    tags:        ['GRC', 'RMF', 'NIST'],
    link:        '#', // TODO #6 — Add project URL or repo link
  },
  {
    name:        'Project Name Two',
    description: 'Brief description of this project. What problem does it solve? What technologies, frameworks, or methodologies are involved?',
    tags:        ['SIEM', 'Detection', 'Automation'],
    link:        '#',
  },
  {
    name:        'Project Name Three',
    description: 'Brief description of this project. What problem does it solve? What technologies, frameworks, or methodologies are involved?',
    tags:        ['Risk', 'Compliance', 'Policy'],
    link:        '#',
  },
  {
    name:        'Project Name Four',
    description: 'Brief description of this project. What problem does it solve? What technologies, frameworks, or methodologies are involved?',
    tags:        ['Cloud', 'Security', 'AWS'],
    link:        '#',
  },
  {
    name:        'Project Name Five',
    description: 'Brief description of this project. What problem does it solve? What technologies, frameworks, or methodologies are involved?',
    tags:        ['Pentest', 'CTF', 'Network'],
    link:        '#',
  },
  {
    name:        'Project Name Six',
    description: 'Brief description of this project. What problem does it solve? What technologies, frameworks, or methodologies are involved?',
    tags:        ['Python', 'Scripting', 'Tool'],
    link:        '#',
  },
]

export default function Projects() {
  return (
    <div className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">

        {/* Section tag */}
        <motion.p
          className="font-mono text-teal/50 text-xs tracking-[0.2em] mb-2"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5 }}
        >
          &lt;projects /&gt;
        </motion.p>

        <motion.h2
          className="font-heading text-4xl md:text-5xl font-bold mb-12"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          Projects
        </motion.h2>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              className="h-full"
              variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
            >
              <GlassCard className="h-full flex flex-col">
                <h3 className="font-heading text-base font-semibold text-white mb-2 leading-snug">
                  {project.name}
                </h3>

                <p className="text-white/55 text-sm leading-relaxed flex-1 mb-4">
                  {project.description}
                </p>

                {/* Tag badges (violet accent) */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs border border-violet/30 text-violet/80 px-2 py-0.5 rounded"
                      style={{ background: 'rgba(123,94,167,0.08)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Ghost view button */}
                <a
                  href={project.link}
                  className="font-mono text-xs border border-teal/25 text-teal/65 px-4 py-2 rounded text-center hover:bg-teal/10 hover:border-teal/50 hover:text-teal transition-all duration-200 mt-auto"
                >
                  [ VIEW ]
                </a>
              </GlassCard>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
