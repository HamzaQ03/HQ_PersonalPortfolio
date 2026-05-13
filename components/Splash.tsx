'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { splashState } from '@/lib/splashState'

/* ─────────────────────────────────────────────────────────────
   SignatureSVG — rendered inside BOTH curtain panels.
   The left panel clips it to the left half (Hamza).
   The right panel clips it to the right half (Qureshi).
   Each half rides outward with its panel when curtains open.
───────────────────────────────────────────────────────────── */
function SignatureSVG({ side }: { side: 'L' | 'R' }) {
  const hamzaId   = `splash-sig-reveal-hamza-${side}`
  const qureshi = `splash-sig-reveal-qureshi-${side}`

  return (
    <svg
      viewBox="0 0 900 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        {/* Hamza reveal: left-to-right wipe, 12.5% → 37.5% of 8 s */}
        <clipPath id={hamzaId}>
          <rect
            x="0" y="0" height="220"
            style={{ animation: 'splash-hamza-reveal 8s cubic-bezier(0.45,0.05,0.55,0.95) forwards' }}
          />
        </clipPath>
        {/* Qureshi reveal: left-to-right wipe, 41.25% → 78.75% of 8 s */}
        <clipPath id={qureshi}>
          <rect
            x="380" y="0" height="220"
            style={{ animation: 'splash-qureshi-reveal 8s cubic-bezier(0.45,0.05,0.55,0.95) forwards' }}
          />
        </clipPath>
      </defs>

      {/* "Hamza" in PrimorStylish, revealed left-to-right */}
      <text
        x="40" y="160"
        fill="#ffffff"
        clipPath={`url(#${hamzaId})`}
        style={{
          fontFamily: "'Primor Stylish', cursive",
          fontSize: '140px',
          fontWeight: 400,
        }}
      >
        Hamza
      </text>

      {/* "Qureshi" in PrimorStylish, revealed left-to-right after pen-lift */}
      <text
        x="390" y="160"
        fill="#ffffff"
        clipPath={`url(#${qureshi})`}
        style={{
          fontFamily: "'Primor Stylish', cursive",
          fontSize: '140px',
          fontWeight: 400,
        }}
      >
        Qureshi
      </text>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   Splash — layout-level overlay, plays on every visit.

   Phase timeline (8 s total):
     0  s –  1.0 s  (0  – 12.5%) Panels closed, signature invisible
     1.0s –  3.0 s  (12.5– 37.5%) Signature strokes draw in
     3.0s –  3.3 s  (37.5– 41.25%) Signature fully drawn, brief hold
     3.3s –  6.8 s  (41.25– 85%)  Curtains slide open (cubic-bezier)
     6.8s –  8.0 s  (85% –100%)   Panels fully off-screen
     8.0 s           Component unmounts (body scroll restored)
───────────────────────────────────────────────────────────── */
export default function Splash() {
  const router = useRouter()
  const [mounted, setSplashMounted] = useState(false)
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    setSplashMounted(true)
    // Mark shown immediately — ShellWrapper gate checks this at render time
    splashState.markShown()

    // Lock body scroll while overlay is present
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Navigate to /home exactly when curtains start opening (41.25% of 8 s = 3300 ms)
    // Home page loads behind the curtains; by the time they finish (6800 ms) it is ready.
    const tNav  = setTimeout(() => router.push('/home'), 3300)
    const tDone = setTimeout(() => {
      document.body.style.overflow = prevOverflow
      setSplashDone(true)
    }, 8000)

    return () => {
      clearTimeout(tNav)
      clearTimeout(tDone)
      document.body.style.overflow = prevOverflow
    }
  }, [router])

  if (!mounted || splashDone) return null

  return (
    <>
      <style>{`
        /* ── Curtain keyframes ──────────────────────────────────── */
        @keyframes splashCurtainL {
          0%, 41.25% {
            transform: translateX(0);
            animation-timing-function: cubic-bezier(0.7, 0, 0.3, 1);
          }
          85%, 100% { transform: translateX(-100%); }
        }
        @keyframes splashCurtainR {
          0%, 41.25% {
            transform: translateX(0);
            animation-timing-function: cubic-bezier(0.7, 0, 0.3, 1);
          }
          85%, 100% { transform: translateX(100%); }
        }

        /* ── Signature text-reveal keyframes ────────────────────── */
        /* Rect width animates 0 → full, producing a left-to-right  */
        /* wipe reveal on the <text> elements via clipPath.          */
        @keyframes splash-hamza-reveal {
          0%, 12.5% { width: 0px; }
          37.5%, 100% { width: 380px; }
        }
        @keyframes splash-qureshi-reveal {
          0%, 41.25% { width: 0px; }
          78.75%, 100% { width: 520px; }
        }
      `}</style>

      {/* ── Outer fixed wrapper ──────────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          pointerEvents: 'auto',
        }}
        aria-hidden="true"
      >

        {/* ── LEFT curtain panel ───────────────────────────────── */}
        {/* Slides left (-100%) during Phase 5.                    */}
        {/* Its SVG container is 200% wide starting at left:0,     */}
        {/* clipped to show only the left half → "Hamza" half.     */}
        <div
          style={{
            position: 'absolute',
            top: 0, bottom: 0, left: 0,
            width: '50%',
            background: '#050505',
            animation: 'splashCurtainL 8s linear 0s both',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '200%',         /* spans full viewport width   */
              transform: 'translateY(-50%)',
              clipPath: 'inset(0 50% 0 0)', /* show left half only  */
            }}
          >
            <SignatureSVG side="L" />
          </div>
        </div>

        {/* ── RIGHT curtain panel ──────────────────────────────── */}
        {/* Slides right (+100%) during Phase 5.                   */}
        {/* Its SVG container is 200% wide, left:-100% so it       */}
        {/* starts at viewport x=0, clipped to right half          */}
        {/* → "Qureshi" half.                                       */}
        <div
          style={{
            position: 'absolute',
            top: 0, bottom: 0, right: 0,
            width: '50%',
            background: '#050505',
            animation: 'splashCurtainR 8s linear 0s both',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '-100%',         /* shift left so SVG aligns with viewport x=0 */
              width: '200%',         /* spans full viewport width                   */
              transform: 'translateY(-50%)',
              clipPath: 'inset(0 0 0 50%)', /* show right half only */
            }}
          >
            <SignatureSVG side="R" />
          </div>
        </div>

      </div>
    </>
  )
}
