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
function SignatureSVG() {
  return (
    <svg
      viewBox="0 0 860 240"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-hidden="true"
    >
      {/* ── Hamza (x ≈ 60–438, left half of viewBox) ── */}
      <path
        pathLength={1000}
        fill="none"
        stroke="#c8a87c"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 60 80 C 55 100, 50 130, 55 150 C 60 165, 70 160, 78 145
           C 85 125, 95 95, 110 75 C 115 70, 122 78, 122 92
           C 122 115, 118 138, 118 152 C 130 140, 145 130, 155 138
           C 162 145, 158 158, 168 158 C 178 158, 180 142, 188 130
           C 195 120, 205 122, 210 138 C 213 152, 220 158, 232 155
           C 240 152, 248 138, 258 130 C 268 122, 280 125, 285 138
           L 295 158 C 300 165, 312 162, 320 152
           C 332 138, 342 125, 358 122 C 372 122, 378 135, 380 152
           C 395 145, 408 138, 420 142 C 432 148, 432 160, 425 168
           C 418 175, 405 172, 400 162 C 408 155, 425 158, 438 165"
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: 1000,
          animation: 'splashSigDraw 8s linear 0s both',
        }}
      />

      {/* ── Qureshi (x ≈ 472–800, right half of viewBox) ── */}
      <path
        pathLength={1000}
        fill="none"
        stroke="#c8a87c"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 510 105 C 495 100, 478 110, 472 130 C 468 148, 478 162, 495 162
           C 510 162, 522 152, 525 138 C 528 122, 522 110, 515 108
           C 525 130, 540 158, 552 178 C 558 188, 552 200, 540 198
           C 532 196, 528 188, 530 180 C 545 170, 565 145, 572 130
           C 580 118, 590 122, 590 135 L 590 158
           C 600 145, 612 135, 625 138 C 638 142, 638 158, 628 165
           C 618 168, 610 162, 612 152 C 622 145, 640 138, 658 132
           C 668 130, 678 138, 678 150 C 678 162, 668 168, 656 162
           C 648 158, 648 148, 660 142 C 678 135, 695 138, 708 145
           C 718 152, 715 165, 705 168 C 695 170, 688 162, 692 155
           C 705 148, 728 142, 745 138 C 752 138, 758 145, 754 152
           C 750 158, 738 158, 738 152 L 738 80
           M 745 140 C 760 145, 772 142, 782 138 L 782 168
           M 800 100 L 800 168"
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: 1000,
          animation: 'splashSigDraw 8s linear 0s both',
        }}
      />
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

        /* ── Signature stroke-draw keyframes ────────────────────── */
        /* stroke-dashoffset goes 1000 → 0 between 12.5% and 37.5%. */
        /* Opacity fades in just after drawing starts (12.5%→18%).  */
        @keyframes splashSigDraw {
          0%, 12.5%   { stroke-dashoffset: 1000; opacity: 0; }
          18%         { stroke-dashoffset: 777;  opacity: 1; }
          37.5%, 100% { stroke-dashoffset: 0;    opacity: 1; }
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
            <SignatureSVG />
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
            <SignatureSVG />
          </div>
        </div>

      </div>
    </>
  )
}
