'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface NavSection {
  id: string
  label: string
}

interface DotNavProps {
  sections: NavSection[]
}

export default function DotNav({ sections }: DotNavProps) {
  const [active, setActive] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { threshold: 0.35, rootMargin: '-15% 0px -15% 0px' }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [sections])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-5">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          className="group relative flex items-center justify-end focus:outline-none"
          aria-label={`Go to ${label}`}
        >
          {/* Tooltip */}
          <span
            className="
              absolute right-6 pointer-events-none
              opacity-0 translate-x-1
              group-hover:opacity-100 group-hover:translate-x-0
              transition-all duration-200
              bg-navy/90 border border-teal/30 text-teal
              text-xs font-mono px-2.5 py-1 rounded
              whitespace-nowrap
            "
          >
            {label}
          </span>

          {/* Dot */}
          <motion.span
            className={`block rounded-full ${
              active === id ? 'bg-teal' : 'bg-white/25 group-hover:bg-teal/50'
            } transition-colors duration-300`}
            animate={{
              width:     active === id ? 12 : 8,
              height:    active === id ? 12 : 8,
              boxShadow: active === id
                ? '0 0 10px #00ffe0, 0 0 20px rgba(0,255,224,0.4)'
                : 'none',
            }}
            transition={{ duration: 0.25 }}
          />
        </button>
      ))}
    </nav>
  )
}
