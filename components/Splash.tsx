'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { splashState } from '@/lib/splashState'
import {
  SIGNATURE_PATH_D,
  SIGNATURE_VB_W,
  SIGNATURE_VB_H,
} from '@/lib/splashSignature'

/* ─────────────────────────────────────────────────────────────
   Splash — cinematic nameplate intro (6.9 s total)

   Phase 1 (0.0s → 0.6s): cinematic city video and nameplate frame
                          fade in from black.
   Phase 2 (0.5s → 4.5s): the vectorized "Hamza Qureshi" signature
                          is revealed left-to-right via an eased
                          clip-path wipe, with a slight pause
                          around the gap between the two names.
   Phase 3 (4.6s → 5.4s): the underline arc sweeps in L→R.
   Phase 4 (5.4s → 5.8s): the dot lands at the end of the underline.
   Phase 5 (5.7s → 6.9s): entire splash fades out (1.2s), revealing /home.

   The home page lives at /home, so the splash navigates there
   early (behind the overlay) and marks the splash as shown so
   ShellWrapper's gate doesn't bounce it back to /. The overlay is
   portalled to document.body so it sits above the navbar / side
   nav / AI logo that ShellWrapper renders once on /home.

   Note: monsieur_signature.svg is a *filled glyph-outline*
   vectorization (fill-rule evenodd, closed contours), so a true
   stroke-dashoffset pen-trace is not possible. The signature is
   rendered as a solid fill and revealed with an eased directional
   clip-path wipe. The underline is a genuine single-stroke path,
   so it uses a real stroke-dashoffset draw.
───────────────────────────────────────────────────────────── */
export default function Splash() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Mark shown immediately so ShellWrapper's gate keeps /home mounted
    splashState.markShown()

    // Lock body scroll while splash is visible
    document.body.style.overflow = 'hidden'

    // Navigate to /home behind the overlay so it is loaded and
    // rendered underneath well before the Phase 5 fade-out.
    const navTimer = setTimeout(() => {
      router.push('/home')
    }, 300)

    // Total splash duration: 6.9s (5.7s fade-out start + 1.2s fade-out)
    const doneTimer = setTimeout(() => {
      document.body.style.overflow = ''
      setSplashDone(true)
    }, 6900)

    return () => {
      clearTimeout(navTimer)
      clearTimeout(doneTimer)
      document.body.style.overflow = ''
    }
  }, [mounted, router])

  if (!mounted || splashDone) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#000000',
        overflow: 'hidden',
        cursor: 'none',
        animation: 'splashFadeOut 1.2s ease-in-out 5.7s forwards',
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes splashFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes splashBgFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        /* Signature reveal — eased left-to-right clip-path wipe of
           the filled signature, with a slight hold around the
           Hamza/Qureshi gap so it reads like writing rather than a
           flat sliding mask. */
        @keyframes splashSigReveal {
          0%   { clip-path: inset(0 100% 0 0); }
          45%  { clip-path: inset(0 50% 0 0); }
          55%  { clip-path: inset(0 45% 0 0); }
          100% { clip-path: inset(0 0% 0 0); }
        }
        /* Underline sweep — a genuine single-stroke path, drawn
           via stroke-dashoffset. */
        @keyframes splashUnderlineDraw {
          from { stroke-dashoffset: 600; }
          to   { stroke-dashoffset: 0; }
        }
        /* Dot fade-in with a slight scale pop. */
        @keyframes splashDotLand {
          0%   { opacity: 0; transform: scale(0.3); }
          70%  { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Cinematic city-at-night video background — looped infinitely,
          slightly blurred so the foreground signature stays the hero. */}
      <video
        src="/City_Night_AI.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          // Brightness drop replaces the CSS blur for a much
          // cheaper "background" feel — real-time blur on a
          // playing 1080p video was the largest per-frame GPU
          // cost.
          filter: 'brightness(0.75)',
          // Slight scale hides any sub-pixel artifacts at the
          // perimeter against the #000 wrapper.
          transform: 'scale(1.05) translateZ(0)',
          opacity: 0,
          animation: 'splashBgFadeIn 0.6s ease-out forwards',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          pointerEvents: 'none',
        }}
      />

      {/* Soft radial vignette on top of the video — darkens the
          edges so the nameplate sits in a slightly brighter zone
          and the signature stays readable. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, ' +
            'rgba(0,0,0,0.15) 0%, ' +
            'rgba(0,0,0,0.45) 70%, ' +
            'rgba(0,0,0,0.65) 100%)',
          opacity: 0,
          animation: 'splashBgFadeIn 0.6s ease-out forwards',
          pointerEvents: 'none',
        }}
      />

      {/* Nameplate frame — gold-bordered semi-transparent panel with
          a backdrop blur on its interior, sitting visually behind
          the signature. */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) translateZ(0)',
          width: 'min(38vw, 580px)',
          aspectRatio: '4 / 1',
          background: 'rgba(5, 5, 5, 0.55)',
          border: '1.5px solid #c8a87c',
          boxShadow:
            '0 0 24px rgba(200, 168, 124, 0.25), ' +
            '0 0 60px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          opacity: 0,
          animation: 'splashBgFadeIn 0.6s ease-out 0.2s forwards',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          pointerEvents: 'none',
        }}
      />

      {/* Inner decorative hairline — completes the museum-placard
          double-frame look. */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(38vw, 580px)',
          aspectRatio: '4 / 1',
          pointerEvents: 'none',
          opacity: 0,
          animation: 'splashBgFadeIn 0.6s ease-out 0.3s forwards',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            border: '0.5px solid rgba(200, 168, 124, 0.5)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Signature composition — filled signature SVG stacked above
          the underline + dot SVG, centered inside the nameplate
          frame. zIndex puts it above the video / vignette / frame. */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) translateZ(0)',
          // Container width sits inside the 580px nameplate with
          // ~35px of breathing room each side. The signature SVG
          // inherits this width; the underline+dot SVG is
          // positioned absolutely inside this container so it
          // does NOT add layout height (otherwise the signature
          // gets pushed up out of frame center).
          width: 'min(34vw, 510px)',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 10,
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {/* SIGNATURE — filled glyph-outline, revealed left-to-right */}
        <svg
          viewBox={`0 0 ${SIGNATURE_VB_W} ${SIGNATURE_VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: 'block',
            width: '100%',
            // At the 510px container width the 3066:748 viewBox
            // renders at ~510×118 — leaves 13-14px of breathing
            // room above the H ascender and below the Q descender
            // inside the 580×145 nameplate interior. The space
            // below the signature gives the underline and dot
            // room to land without crossing the gold border.
            height: 'auto',
            maxHeight: 'min(11vh, 118px)',
            overflow: 'visible',
            clipPath: 'inset(0 100% 0 0)',
            animation: 'splashSigReveal 5s ease-out 0.5s forwards',
            willChange: 'clip-path, transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          <path
            d={SIGNATURE_PATH_D}
            fill="#ffffff"
            fillRule="evenodd"
            stroke="none"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))',
            }}
          />
        </svg>

        {/* UNDERLINE + DOT — a separate SVG below the signature */}
        <svg
          viewBox="0 0 600 40"
          preserveAspectRatio="xMinYMid meet"
          style={{
            // Absolute positioning keeps this SVG out of the
            // composition's layout flow so it doesn't push the
            // signature off vertical center. Sits low across the
            // signature, anchoring beneath the last few letters.
            position: 'absolute',
            top: '80%',
            left: 0,
            width: '100%',
            height: 'auto',
            overflow: 'visible',
            willChange: 'clip-path, transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          {/* Underline arc — starts under "ur" of "ureshi" and
              sweeps gently up to the right. */}
          <path
            d="M 380 25 Q 480 18 580 14"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: 600,
              strokeDashoffset: 600,
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))',
              animation: 'splashUnderlineDraw 0.8s ease-out 4.6s forwards',
            }}
          />
          {/* Dot — lands after the underline finishes, with a clear
              gap (line ends at x=490, dot at x=555). */}
          <circle
            cx="605"
            cy="13"
            r="5"
            fill="#ffffff"
            style={{
              opacity: 0,
              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))',
              transformOrigin: '605px 13px',
              animation: 'splashDotLand 0.4s ease-out 5.4s forwards',
            }}
          />
        </svg>
      </div>
    </div>,
    document.body
  )
}
