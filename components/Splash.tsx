'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, usePathname } from 'next/navigation'
import { splashState } from '@/lib/splashState'
import {
  SIGNATURE_PATH_D,
  SIGNATURE_VB_W,
  SIGNATURE_VB_H,
} from '@/lib/splashSignature'

/* ─────────────────────────────────────────────────────────────
   Splash — cinematic full-width signature reveal (8.5 s total)

   Phase 1 (0.0s → 0.6s): video + dark radial overlay fade in.
   Phase 2 (0.0s → ≤1.5s): video buffers. The moment
                           `canPlayThrough` fires (or the 1.5s
                           fallback elapses) the signature
                           composition mounts.
   Phase 3 (mount + 0.3s → +5.3s): the signature renders as a
                           STATIC SVG once; a translucent black
                           gradient mask layered on top slides
                           right via translateX, revealing it.
                           translateX runs on the GPU compositor
                           with zero per-frame rasterization on
                           the signature underneath — which is
                           what kills the "Q lag" the previous
                           clip-path / stroke-dashoffset
                           approaches suffered from.
   Phase 4 (mount + 5.5s → +6.5s): underline draws via
                           stroke-dashoffset.
   Phase 5 (mount + 6.5s → +6.9s): dot lands with a scale pop.
   Phase 6 (7.3s → 8.5s): entire splash fades out (1.2s), revealing
                          /home underneath.

   The home page lives at /home, so the splash navigates there
   early (behind the overlay) and marks the splash as shown so
   ShellWrapper's gate doesn't bounce it back to /. The overlay is
   portalled to document.body so it sits above the navbar / side
   nav / AI logo that ShellWrapper renders once on /home.
───────────────────────────────────────────────────────────── */
export default function Splash() {
  const router = useRouter()
  const pathname = usePathname()
  // Skip the cinematic intro entirely on /dashboard* routes. The splash is
  // rendered from the root layout so it mounts on every direct URL load —
  // without this guard, hitting /dashboard or /dashboard/login fresh would
  // play the intro and kidnap the user to /home before the page even paints.
  const skipSplash = pathname?.startsWith('/dashboard') ?? false
  const [mounted, setMounted] = useState(false)
  const [splashDone, setSplashDone] = useState(false)
  // Drive the fade-out in state so the CSS keyframe animation isn't a
  // single point of failure. Same stuck-at-currentTime-0 class of bug
  // we just hit on the home-page-reveal CSS animation: if the browser
  // never advances the splash CSS keyframe, the overlay stays solid
  // black until splashDone unmounts it — and any glitch in unmount
  // timing leaves a residual black frame. A JS-driven opacity is
  // guaranteed to take effect since it's just an inline style write.
  const [overlayOpacity, setOverlayOpacity] = useState(1)
  // Fade-out duration flips to a fast value when the user clicks Skip
  // so the opacity transition finishes before setSplashDone() unmounts.
  const [fastFade, setFastFade] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  // Stash the router in a ref so the mount/unmount effect below
  // doesn't have to take `router` as a dep. If `useRouter()` were
  // ever non-stable across renders, taking it as a dep would tear
  // down the navTimer/doneTimer before they fire and the splash
  // would never reach /home or unmount.
  const routerRef = useRef(router)
  routerRef.current = router
  // All pending timers live in this ref so the Skip button can clear
  // every one of them in a single sweep without the effect having to
  // re-run to tear them down.
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (skipSplash) return

    // Mark shown immediately so ShellWrapper's gate keeps /home mounted
    splashState.markShown()

    // Lock body scroll while splash is visible
    document.body.style.overflow = 'hidden'

    const timers = timersRef.current

    // Navigate to /home behind the overlay so it is loaded and
    // rendered underneath well before the Phase 6 fade-out.
    timers.push(setTimeout(() => {
      routerRef.current.push('/home')
    }, 300))

    // Timeline (no pre-roll — signature starts tracing at t=0):
    //   0s     signature mask reveal begins (5s)
    //   5s     signature complete, underline starts (1s)
    //   6s     underline complete, dot lands (0.4s)
    //   6.4s   dot landed → 0.6s dramatic pause
    //   7s     splash fade-out begins (1.2s)
    //   8.2s   splash unmounts, /home visible
    timers.push(setTimeout(() => {
      setOverlayOpacity(0)
    }, 7000))

    timers.push(setTimeout(() => {
      document.body.style.overflow = ''
      routerRef.current.push('/home')
      setSplashDone(true)
    }, 8200))

    return () => {
      timers.forEach(clearTimeout)
      timersRef.current = []
      document.body.style.overflow = ''
    }
  }, [mounted, skipSplash])

  function handleSkip() {
    // Kill every pending timer so the fade-out and done handlers don't
    // fire on top of the skip flow and re-trigger navigation mid-fade.
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setFastFade(true)
    setOverlayOpacity(0)
    // Push /home in parallel with the fade-out — chunk load starts
    // during the 0.35s fade so the home page is ready underneath.
    routerRef.current.push('/home')
    setTimeout(() => {
      document.body.style.overflow = ''
      setSplashDone(true)
    }, 350)
  }

  // Note on video playback: the previous reverse-loop trick (forward
  // play, then step currentTime backward via rAF every animation
  // frame) was the source of the splash lag — manually seeking the
  // video each tick forces the browser to decode the previous frame
  // and re-paint on every rAF call, which is brutally expensive even
  // on mid-tier GPUs. Replaced with a native `loop` attribute on the
  // <video> element. Small "loop snap" cosmetic trade-off in exchange
  // for buttery smooth playback throughout the splash.

  if (!mounted || splashDone || skipSplash) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#000000',
        overflow: 'hidden',
        cursor: 'none',
        // JS-driven fade instead of a CSS keyframe — see the
        // overlayOpacity state comment in the component for context.
        opacity: overlayOpacity,
        transition: fastFade ? 'opacity 350ms ease-out' : 'opacity 1.2s ease-in-out',
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
        /* Mask reveal — animates the CSS mask-position on the
           signature SVG itself. No separate overlay element, so
           nothing visually occludes the video underneath. The mask
           is 400% wide with a soft black-to-transparent edge; as
           mask-position slides from 100% (signature fully hidden)
           to 0% (signature fully revealed), the soft edge sweeps
           across, fading the signature in left-to-right. */
        @keyframes splashMaskReveal {
          0%   {
            mask-position: 100% 0%;
            -webkit-mask-position: 100% 0%;
          }
          100% {
            mask-position: 0% 0%;
            -webkit-mask-position: 0% 0%;
          }
        }
        @keyframes splashUnderlineDraw {
          from { stroke-dashoffset: 1200; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes splashDotLand {
          0%   { opacity: 0; transform: scale(0.3); }
          70%  { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
        /* Full-screen backdrop blur fades in just before the signature
           starts tracing, then stays through the signature, underline,
           and dot reveal. Fades out with the splash overlay at 7.3s. */
        @keyframes splashBlurFadeIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* Cinematic city video background.
          Render the <video> with NOTHING that pushes it onto a separate
          GPU compositing layer. The previous setup combined
          filter: brightness(...), transform: translateZ(0), willChange,
          and backface-visibility — which together force the browser to
          decode the video to a GPU texture and then composite, and that
          texture gets resampled at a quality noticeably below the
          source on most displays (looks soft / muddy compared to the
          same file in a native player). Plain video, no filter, no
          transform = direct decode straight to the screen. */}
      <video
        ref={videoRef}
        src="/City_Night_AI2.mp4"
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
          opacity: 0,
          animation: 'splashBgFadeIn 0.6s ease-out forwards',
          pointerEvents: 'none',
        }}
      />

      {/* Dim overlay for signature contrast — visible from t=0 so the
          white signature reads clearly the moment the splash mounts.
          Uses opacity only (single composite op per frame, near-zero
          GPU cost). Replaced the previous filter: blur on the video,
          which forced a blur shader to run on every video frame and
          was the root cause of the splash playback lag. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />




      {/* Signature composition — mounts at t=0 so the mask reveal
          starts tracing the moment the splash appears (no pre-roll).
          The dim overlay above provides contrast against the city
          video, and the fade-out at 7s carries the whole thing off
          together. */}
      {(
        <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) translateZ(0)',
            // Signature spans most of the viewport — large and
            // dramatic, no nameplate frame.
            width: 'min(80vw, 1200px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 10,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Signature SVG — clean fill, no aura, no bold stroke.
              The full-screen backdrop blur (sibling element below)
              provides the contrast against the city video. */}
          <svg
            viewBox={`0 0 ${SIGNATURE_VB_W} ${SIGNATURE_VB_H}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              maskImage:
                'linear-gradient(to right, ' +
                'black 0%, ' +
                'black 25%, ' +
                'transparent 35%, ' +
                'transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, ' +
                'black 0%, ' +
                'black 25%, ' +
                'transparent 35%, ' +
                'transparent 100%)',
              maskSize: '400% 100%',
              WebkitMaskSize: '400% 100%',
              maskPosition: '0% 0%',
              WebkitMaskPosition: '0% 0%',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              animation:
                'splashMaskReveal 5s cubic-bezier(0.55, 0.05, 0.25, 1) 0s both',
              willChange: 'mask-position',
              backfaceVisibility: 'hidden',
            }}
          >
            <path
              d={SIGNATURE_PATH_D}
              fill="#ffffff"
              stroke="none"
            />
          </svg>

          {/* Underline + dot below the signature — clean white. */}
          <svg
            viewBox="0 0 1000 50"
            preserveAspectRatio="xMidYMid meet"
            style={{
              width: '60%',
              height: 'auto',
              marginTop: '-10px',
              overflow: 'visible',
            }}
          >
            <path
              d="M 300 25 Q 575 17 850 13"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: 1200,
                strokeDashoffset: 1200,
                animation:
                  'splashUnderlineDraw 1.0s ease-out 5.0s forwards',
                willChange: 'stroke-dashoffset',
              }}
            />
            <circle
              cx="890"
              cy="11"
              r="6"
              fill="#ffffff"
              style={{
                opacity: 0,
                transformOrigin: '890px 11px',
                animation:
                  'splashDotLand 0.4s ease-out 6.0s forwards',
                willChange: 'transform, opacity',
              }}
            />
          </svg>
        </div>
      )}

      {/* Skip button — lets impatient / repeat visitors bypass the
          cinematic intro. Positioned bottom-right, unobtrusive taupe
          on the darkened backdrop. handleSkip clears every pending
          timer, fast-fades the overlay in 350ms, and pushes /home. */}
      <button
        className="splash-skip-btn"
        onClick={handleSkip}
        aria-label="Skip intro"
        style={{
          position: 'absolute',
          bottom: 32,
          right: 32,
          zIndex: 20,
          background: 'transparent',
          border: '1px solid rgba(200, 168, 124, 0.4)',
          borderRadius: 4,
          color: '#c8a87c',
          padding: '10px 18px',
          fontFamily: 'monospace',
          fontSize: 11,
          letterSpacing: 2,
          transition: 'background 200ms ease, color 200ms ease, border-color 200ms ease',
        }}
      >
        SKIP ›
      </button>
    </div>,
    document.body
  )
}
