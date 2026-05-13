'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { playClickSound } from '@/lib/sound'
import SecretAccessModal from '@/components/SecretAccessModal'

const LINKS = [
  { label: 'Home',           href: '/home' },
  { label: 'Education',      href: '/education' },
  { label: 'Skills',         href: '/skills' },
  { label: 'Experience',     href: '/experience' },
  { label: 'Projects',       href: '/projects' },
  { label: 'Certifications & Clearances', href: '/certifications' },
  { label: 'Reviews',        href: '/reviews' },
  { label: 'Connect',        href: '/connect' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const [secretOpen, setSecretOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center py-3 px-6"
      style={{
        background: 'rgba(0,0,0,0.90)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(200,168,124,0.12)',
      }}
    >
      {/* Logo / initials — click to open secret easter egg modal */}
      <button
        className="font-heading font-bold text-lg tracking-widest mb-2 focus:outline-none"
        style={{ color: '#c8a87c', background: 'none', border: 'none', cursor: 'pointer', transition: 'text-shadow 0.2s ease' }}
        onClick={() => { playClickSound(); setSecretOpen(true) }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.textShadow = '0 0 18px rgba(200,168,124,0.6)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.textShadow = 'none' }}
        aria-label="Secret access"
      >
        HQ
      </button>

      {/* Desktop links */}
      <div
        className="hidden md:flex items-center"
        style={{ gap: 32 }}
        onMouseLeave={() => setHovered(null)}
      >
        {LINKS.map(link => {
          const isActive  = pathname === link.href
          const isHovered = hovered === link.href
          const isFaded   = hovered !== null && !isHovered && !isActive
          return (
            <motion.div
              key={link.href}
              animate={{ scale: isHovered ? 1.08 : isFaded ? 0.95 : 1 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              style={{ display: 'inline-block' }}
            >
              <Link
                href={link.href}
                className="relative font-mono tracking-widest focus:outline-none"
                style={{
                  fontSize: 12,
                  color: isActive ? '#c8a87c' : '#ffffff',
                  textShadow: isActive
                    ? '0 0 12px rgba(200,168,124,0.6)'
                    : isHovered
                    ? '0 0 8px rgba(245,232,212,0.3)'
                    : 'none',
                  borderBottom: isActive ? '2px solid #c8a87c' : '2px solid transparent',
                  paddingBottom: 4,
                  transition: 'color 0.18s ease, text-shadow 0.18s ease, border-color 0.18s ease',
                  display: 'block',
                  opacity: isFaded ? 0.35 : 1,
                }}
                onMouseEnter={() => setHovered(link.href)}
                onClick={playClickSound}
              >
                {link.label}
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden absolute right-6 top-4 focus:outline-none"
        style={{ color: '#c8a87c' }}
        onClick={() => { playClickSound(); setMenuOpen(m => !m) }}
        aria-label="Toggle menu"
      >
        <span className="font-mono text-lg">{menuOpen ? '✕' : '☰'}</span>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 flex flex-col items-center gap-4 py-6"
          style={{
            background: 'rgba(0,0,0,0.97)',
            borderBottom: '1px solid rgba(200,168,124,0.12)',
          }}
        >
          {LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-sm"
              style={{ color: pathname === link.href ? '#c8a87c' : 'rgba(200,168,124,0.5)' }}
              onClick={() => { playClickSound(); setMenuOpen(false) }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
      <SecretAccessModal open={secretOpen} onClose={() => setSecretOpen(false)} />
    </nav>
  )
}
