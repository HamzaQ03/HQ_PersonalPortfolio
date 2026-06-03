'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { playClickSound } from '@/lib/sound'

const PAGE_SECTIONS: Record<string, { id: string; label: string }[]> = {
  '/home': [
    { id: 'welcome',  label: 'Welcome'  },
    { id: 'name',     label: 'Name'     },
    { id: 'tagline',  label: 'Tagline'  },
    { id: 'bio',      label: 'Bio'      },
  ],
  '/skills': [
    { id: 'technical',    label: 'Technical'    },
    { id: 'grc',          label: 'GRC'          },
    { id: 'aa',           label: 'A&A'          },
    { id: 'cloud',        label: 'Cloud'        },
    { id: 'tools',        label: 'Tools'        },
    { id: 'soft',         label: 'Soft'         },
    { id: 'professional', label: 'Competencies' },
  ],
  '/experience': [
    { id: 'role-1', label: 'Role 1' },
    { id: 'role-2', label: 'Role 2' },
    { id: 'role-3', label: 'Role 3' },
    { id: 'role-4', label: 'Role 4' },
    { id: 'role-5', label: 'Role 5' },
    { id: 'role-6', label: 'Role 6' },
  ],
  '/certifications': [
    { id: 'clearance',             label: 'Clearance'             },
    { id: 'active-certifications', label: 'Active Certifications' },
    { id: 'in-progress',           label: 'In Progress'           },
  ],
}

export default function DotSideNav() {
  const pathname           = usePathname()
  const isExperience       = pathname === '/experience'
  const isCertifications   = pathname === '/certifications'
  const isSkills           = pathname === '/skills'
  const useHoverPreview    = isExperience || isCertifications || isSkills

  // ── All hooks declared unconditionally (Rules of Hooks) ──
  const [active,  setActive]  = useState<string>('')
  const [hovered, setHovered] = useState<string | null>(null)

  // Hover-preview scroll refs (experience page only)
  const savedScrollY = useRef<number | null>(null)
  const returnTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sections = PAGE_SECTIONS[pathname] ?? []

  // IntersectionObserver — keeps active dot in sync with scroll
  useEffect(() => {
    if (sections.length === 0) return
    setActive(sections[0]?.id ?? '')
    const observers: IntersectionObserver[] = []
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { threshold: 0.25, rootMargin: '-10% 0px -10% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Cancel return-scroll when the user enters a card (experience + certifications pages)
  useEffect(() => {
    if (!useHoverPreview) return
    const handler = () => {
      if (returnTimer.current) { clearTimeout(returnTimer.current); returnTimer.current = null }
      savedScrollY.current = null
    }
    window.addEventListener('experience:roleCardEntered', handler)
    window.addEventListener('certifications:cardEntered', handler)
    window.addEventListener('skills:cardEntered', handler)
    return () => {
      window.removeEventListener('experience:roleCardEntered', handler)
      window.removeEventListener('certifications:cardEntered', handler)
      window.removeEventListener('skills:cardEntered', handler)
    }
  }, [useHoverPreview])

  // ── Early returns AFTER all hooks ──
  if (pathname === '/' || pathname === '/home' || sections.length === 0) return null

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleDotEnter(id: string) {
    setHovered(id)
    if (!useHoverPreview) return
    // Save original position only on the very first hover in this sequence
    if (savedScrollY.current === null) savedScrollY.current = window.scrollY
    // Cancel any pending return timer (e.g. moving dot-to-dot)
    if (returnTimer.current) { clearTimeout(returnTimer.current); returnTimer.current = null }
    scrollToSection(id)
  }

  function handleDotLeave() {
    setHovered(null)
    if (!useHoverPreview) return
    // Start a 250ms window — if cursor enters a role card, the event handler cancels this
    returnTimer.current = setTimeout(() => {
      if (savedScrollY.current !== null) {
        window.scrollTo({ top: savedScrollY.current, behavior: 'smooth' })
        savedScrollY.current = null
      }
      returnTimer.current = null
    }, 250)
  }

  function handleClick(id: string) {
    playClickSound()
    // Commit the position — cancel any pending return
    if (returnTimer.current) { clearTimeout(returnTimer.current); returnTimer.current = null }
    savedScrollY.current = null
    scrollToSection(id)
  }

  return (
    <nav
      className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-3"
      style={{ zIndex: 40 }}
    >
      {sections.map(({ id, label }) => {
        const isActive  = active === id
        const isHovered = hovered === id
        return (
          <button
            key={id}
            onClick={() => handleClick(id)}
            onMouseEnter={() => handleDotEnter(id)}
            onMouseLeave={handleDotLeave}
            className="relative flex items-center justify-end focus:outline-none"
            aria-label={label}
          >
            {/* Label — pill style, slides in from right */}
            <span
              className="absolute font-mono whitespace-nowrap select-none"
              style={{
                right: 'calc(100% + 14px)',
                top: '50%',
                transform: isHovered
                  ? 'translateY(-50%) translateX(-4px)'
                  : 'translateY(-50%) translateX(0)',
                fontSize: 10,
                letterSpacing: '1.5px',
                color: '#c8a87c',
                padding: '5px 10px',
                background: '#0a0a0a',
                border: '1px solid rgba(200,168,124,0.4)',
                borderRadius: 4,
                boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 200ms ease, transform 200ms ease',
                pointerEvents: 'none',
              }}
            >
              {label}
            </span>

            {/* Dot */}
            <motion.span
              className="block rounded-full"
              animate={{
                width:           isHovered ? 10 : isActive ? 8 : 6,
                height:          isHovered ? 10 : isActive ? 8 : 6,
                backgroundColor: isActive || isHovered ? '#c8a87c' : '#1c1c1c',
                scale:           isHovered ? 1.6 : 1,
                boxShadow:       isHovered
                  ? '0 0 14px rgba(200,168,124,0.9)'
                  : isActive
                  ? '0 0 8px rgba(200,168,124,0.7)'
                  : 'none',
              }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          </button>
        )
      })}
    </nav>
  )
}
