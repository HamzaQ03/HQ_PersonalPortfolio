'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const glowRef = useRef<HTMLDivElement>(null)
  const dotRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY
      if (glowRef.current) {
        glowRef.current.style.transform =
          `translate3d(${x - 28}px, ${y - 28}px, 0)`
      }
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate3d(${x - 4.5}px, ${y - 4.5}px, 0)`
      }
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      <style>{`
        @keyframes cursorBreathe {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1;   }
        }
        html, body, * {
          cursor: none !important;
        }
        @media (max-width: 767px) {
          .cc-glow, .cc-dot {
            display: none !important;
          }
          html, body, * {
            cursor: auto !important;
          }
        }
      `}</style>

      {/* Outer glow */}
      <div
        ref={glowRef}
        className="cc-glow"
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          width:           '56px',
          height:          '56px',
          borderRadius:    '50%',
          background:      'radial-gradient(circle, rgba(200,168,124,0.45) 0%, rgba(200,168,124,0.25) 30%, rgba(200,168,124,0.10) 60%, rgba(200,168,124,0) 100%)',
          filter:          'blur(8px)',
          pointerEvents:   'none',
          zIndex:          99998,
          transition:      'none',
          willChange:      'transform',
          animation:       'cursorBreathe 2s ease-in-out infinite',
          backgroundColor: 'transparent',
          border:          'none',
          padding:         0,
          margin:          0,
          boxShadow:       'none',
          transform:       'translate3d(-100px, -100px, 0)',
        }}
      />

      {/* Core dot — higher z-index than glow so it always sits on top */}
      <div
        ref={dotRef}
        className="cc-dot"
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          width:           '9px',
          height:          '9px',
          borderRadius:    '50%',
          background:      'rgba(200,168,124,1)',
          backgroundColor: 'rgba(200,168,124,1)',
          pointerEvents:   'none',
          zIndex:          99999,
          transition:      'none',
          willChange:      'transform',
          border:          'none',
          padding:         0,
          margin:          0,
          boxShadow:       'none',
          transform:       'translate3d(-100px, -100px, 0)',
        }}
      />
    </>
  )
}
