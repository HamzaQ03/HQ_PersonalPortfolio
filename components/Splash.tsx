'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
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
  const [mounted, setMounted] = useState(false)
  const [splashDone, setSplashDone] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  // Stash the router in a ref so the mount/unmount effect below
  // doesn't have to take `router` as a dep. If `useRouter()` were
  // ever non-stable across renders, taking it as a dep would tear
  // down the navTimer/doneTimer before they fire and the splash
  // would never reach /home or unmount.
  const routerRef = useRef(router)
  routerRef.current = router

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Mark shown immediately so ShellWrapper's gate keeps /home mounted
    splashState.markShown()

    // Lock body scroll while splash is visible
    document.body.style.overflow = 'hidden'

    // Fallback: force the signature composition to mount even if
    // `canPlayThrough` never fires on this device.
    const videoFallback = setTimeout(() => {
      setVideoReady(true)
    }, 1500)

    // Navigate to /home behind the overlay so it is loaded and
    // rendered underneath well before the Phase 6 fade-out.
    const navTimer = setTimeout(() => {
      routerRef.current.push('/home')
    }, 300)

    // Total splash duration: 8.5s (7.3s fade-out start + 1.2s fade).
    // Also re-push /home as a safety net — Next.js no-ops if we're
    // already there, but if the 300ms push got eaten by a render
    // race this guarantees the user reaches /home before we unmount.
    const doneTimer = setTimeout(() => {
      document.body.style.overflow = ''
      routerRef.current.push('/home')
      setSplashDone(true)
    }, 8500)

    return () => {
      clearTimeout(videoFallback)
      clearTimeout(navTimer)
      clearTimeout(doneTimer)
      document.body.style.overflow = ''
    }
  }, [mounted])

  // Reverse-loop playback. Plays forward to the end, then steps
  // backward through frames via requestAnimationFrame, then forward
  // again — eliminates the "loop snap" of a hard restart since the
  // city camera ends in a different position than it starts.
  useEffect(() => {
    if (!mounted) return

    const video = videoRef.current
    if (!video) return

    let direction: 1 | -1 = 1
    let rafId: number | null = null

    // Step backward one frame's worth of duration per render frame,
    // matching the source video's 24fps frame rate.
    const REVERSE_STEP_PER_FRAME = 1 / 24

    const tick = () => {
      if (!video) return

      if (direction === 1) {
        // Forward — native browser playback. Intervene only at the
        // tail end of the clip.
        if (video.currentTime >= video.duration - 0.05) {
          direction = -1
          video.pause()
        }
      } else {
        // Reverse — browsers can't natively play backward, so step
        // currentTime backward manually on every render frame.
        const newTime = video.currentTime - REVERSE_STEP_PER_FRAME
        if (newTime <= 0.05) {
          direction = 1
          video.currentTime = 0
          video.play().catch(() => {
            // autoplay may be blocked — ignore
          })
        } else {
          video.currentTime = newTime
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    const startTicking = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(tick)
      }
    }

    if (video.readyState >= 3) {
      startTicking()
    } else {
      video.addEventListener('canplay', startTicking, { once: true })
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      video.removeEventListener('canplay', startTicking)
    }
  }, [mounted])

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
        animation: 'splashFadeOut 1.2s ease-in-out 7.3s forwards',
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
      `}</style>

      {/* Cinematic city video background */}
      <video
        ref={videoRef}
        src="/City_Night_AI2.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onCanPlayThrough={() => setVideoReady(true)}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          // Brightness drop instead of blur — much cheaper per
          // frame, the largest GPU saving in this pass.
          filter: 'brightness(0.7)',
          opacity: 0,
          animation: 'splashBgFadeIn 0.6s ease-out forwards',
          willChange: 'opacity',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          pointerEvents: 'none',
        }}
      />

      {/* Soft dark radial overlay — gives the white signature
          contrast against bright spots in the city footage. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, ' +
            'rgba(0,0,0,0.25) 0%, ' +
            'rgba(0,0,0,0.55) 70%, ' +
            'rgba(0,0,0,0.75) 100%)',
          opacity: 0,
          animation: 'splashBgFadeIn 0.6s ease-out forwards',
          pointerEvents: 'none',
          transform: 'translateZ(0)',
        }}
      />

      {/* Signature composition — only mounts once the video can
          play through (or the 1.5s fallback fires). Large and
          centered; reveal is a sliding mask, not a clip-path. */}
      {videoReady && (
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
          {/* Signature with CSS mask-image gradient reveal. The
              mask lives as a property on the signature SVG itself
              — no separate overlay element — so nothing visually
              occludes the city video underneath. The mask gradient
              is 400% wide with a soft black-to-transparent edge;
              mask-position animates from 100% (fully masked) to 0%
              (fully revealed), sweeping the soft edge across the
              signature. */}
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
              // Base value matches the animation END state ("revealed").
              // The animation's keyframe 0% explicitly resets it to the
              // hidden state during the play window. Using `both` fill
              // mode means the keyframe 0% value (hidden) also covers
              // the 0.3s delay, so the signature doesn't flash visible
              // before the reveal starts. If the animation is ever
              // released by the browser, the base value (revealed) is
              // what persists — the signature can't vanish.
              maskPosition: '0% 0%',
              WebkitMaskPosition: '0% 0%',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              animation:
                'splashMaskReveal 5s cubic-bezier(0.55, 0.05, 0.25, 1) 0.3s both',
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

          {/* Underline + dot below the signature */}
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
              d="M 300 25 Q 550 18 800 14"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: 1200,
                strokeDashoffset: 1200,
                animation:
                  'splashUnderlineDraw 1.0s ease-out 5.5s forwards',
                willChange: 'stroke-dashoffset',
              }}
            />
            <circle
              cx="870"
              cy="12"
              r="6"
              fill="#ffffff"
              style={{
                opacity: 0,
                transformOrigin: '870px 12px',
                animation:
                  'splashDotLand 0.4s ease-out 6.5s forwards',
                willChange: 'transform, opacity',
              }}
            />
          </svg>
        </div>
      )}
    </div>,
    document.body
  )
}
