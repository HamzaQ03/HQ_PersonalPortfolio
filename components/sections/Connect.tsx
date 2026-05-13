'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, FileDown } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0  },
}

// TODO #10 — Replace '#' with your actual links
const socialLinks = [
  {
    label: 'LinkedIn',
    href:  '#', // TODO #10 — e.g. https://linkedin.com/in/yourname
    icon:  Linkedin,
  },
  {
    label: 'GitHub',
    href:  '#', // TODO #10 — e.g. https://github.com/yourname
    icon:  Github,
  },
  {
    label: 'Email',
    href:  '#', // TODO #10 — e.g. mailto:you@email.com
    icon:  Mail,
  },
  {
    label: 'Resume',
    href:  '#', // TODO #10 — Link to your resume PDF
    icon:  FileDown,
  },
]

export default function Connect() {
  return (
    <div className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto text-center">

        {/* Section tag */}
        <motion.p
          className="font-mono text-teal/50 text-xs tracking-[0.2em] mb-2"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5 }}
        >
          &lt;connect /&gt;
        </motion.p>

        <motion.h2
          className="font-heading text-4xl md:text-5xl font-bold mb-4"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
        >
          Let&apos;s Connect.
        </motion.h2>

        <motion.p
          className="text-white/45 text-base mb-12 max-w-md mx-auto"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
        >
          Open to new opportunities, collaborations, and conversations.
          Reach out through any of the channels below.
        </motion.p>

        {/* Social / link buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-16"
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
        >
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <motion.a
              key={label}
              href={href}
              className="flex items-center gap-2 font-mono text-sm border border-teal/30 text-teal px-6 py-3 rounded-lg hover:bg-teal hover:text-navy transition-all duration-300 focus:outline-none"
              whileHover={{ boxShadow: '0 0 22px rgba(0,255,224,0.3)' }}
              target={href !== '#' ? '_blank' : undefined}
              rel={href !== '#' ? 'noopener noreferrer' : undefined}
            >
              <Icon size={15} />
              {label}
            </motion.a>
          ))}
        </motion.div>

        {/* Contact form */}
        {/* TODO #11 — Wire up form submission to EmailJS or Resend API */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassCard className="text-left" static>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-heading text-lg font-semibold text-white">Send a Message</h3>
            </div>
            <p className="font-mono text-teal/35 text-xs mb-6">
              {/* TODO #11 */}
              // Connect to EmailJS or Resend API
            </p>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-white/35 text-xs block mb-1.5 tracking-widest">
                    NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="
                      w-full bg-white/[0.04] border border-teal/15 rounded-lg
                      px-4 py-2.5 text-white text-sm placeholder-white/18
                      focus:outline-none focus:border-teal/40
                      focus:shadow-[0_0_12px_rgba(0,255,224,0.1)]
                      transition-all duration-200
                    "
                  />
                </div>
                <div>
                  <label className="font-mono text-white/35 text-xs block mb-1.5 tracking-widest">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="
                      w-full bg-white/[0.04] border border-teal/15 rounded-lg
                      px-4 py-2.5 text-white text-sm placeholder-white/18
                      focus:outline-none focus:border-teal/40
                      focus:shadow-[0_0_12px_rgba(0,255,224,0.1)]
                      transition-all duration-200
                    "
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-white/35 text-xs block mb-1.5 tracking-widest">
                  MESSAGE
                </label>
                <textarea
                  rows={4}
                  placeholder="Your message..."
                  className="
                    w-full bg-white/[0.04] border border-teal/15 rounded-lg
                    px-4 py-2.5 text-white text-sm placeholder-white/18
                    focus:outline-none focus:border-teal/40
                    focus:shadow-[0_0_12px_rgba(0,255,224,0.1)]
                    transition-all duration-200 resize-none
                  "
                />
              </div>

              <button
                type="submit"
                className="
                  w-full font-mono text-sm border border-teal/35 text-teal
                  py-3 rounded-lg hover:bg-teal hover:text-navy
                  transition-all duration-300
                "
                style={{ boxShadow: '0 0 14px rgba(0,255,224,0.1)' }}
              >
                [ TRANSMIT MESSAGE ]
              </button>
            </form>
          </GlassCard>
        </motion.div>

      </div>
    </div>
  )
}
