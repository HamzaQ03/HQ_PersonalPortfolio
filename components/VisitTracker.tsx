'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { getVisitorId, getSessionId, getLanguage, getTimezone } from '@/lib/visitor'

export default function VisitTracker() {
  const pathname = usePathname()
  const sessionIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (pathname.startsWith('/dashboard')) return

    const visitorId = getVisitorId()
    const browserSessionId = getSessionId()
    const language = getLanguage()
    const timezone = getTimezone()

    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: visitorId,
        browser_session_id: browserSessionId,
        page: pathname,
        language,
        timezone,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.session_id) {
          sessionIdRef.current = data.session_id
        }
      })
      .catch(() => {})
  }, [pathname])

  // Attach a passive global click listener to capture clicks on key buttons
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (pathname.startsWith('/dashboard')) return

    const KEY_LABELS: Record<string, string> = {
      'resume access': 'resume_access',
      'request resume': 'resume_access',
      'linkedin': 'linkedin',
      'schedule meeting': 'schedule_meeting',
      'book a meeting': 'schedule_meeting',
      '30 min': 'schedule_meeting',
      'send a message': 'send_message',
      'send message': 'send_message',
      'share your experience': 'leave_review',
      'leave a review': 'leave_review',
      'preview certificate': 'preview_certificate',
      'preview recommendation letter': 'preview_letter',
      'download letter': 'download_letter',
    }

    function getButtonLabel(el: HTMLElement): string | null {
      const text = (el.innerText || el.textContent || '').toLowerCase().trim()
      for (const [needle, label] of Object.entries(KEY_LABELS)) {
        if (text.includes(needle)) return label
      }
      return null
    }

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return

      // Walk up the DOM to find a clickable element (button, a, or [role=button])
      let el: HTMLElement | null = target
      for (let i = 0; i < 6 && el; i++) {
        if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button') {
          break
        }
        el = el.parentElement
      }
      if (!el) return

      const label = getButtonLabel(el)
      if (!label) return

      const visitorId = getVisitorId()
      const browserSessionId = getSessionId()

      fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: visitorId,
          browser_session_id: browserSessionId,
          target: label,
          page: pathname,
        }),
        keepalive: true,
      }).catch(() => {})
    }

    document.addEventListener('click', handleClick, { passive: true, capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true } as EventListenerOptions)
  }, [pathname])

  // Send session-end beacon on tab close/hide
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (pathname.startsWith('/dashboard')) return

    function sendEndBeacon() {
      const visitorId = getVisitorId()
      const browserSessionId = getSessionId()
      const body = JSON.stringify({
        visitor_id: visitorId,
        browser_session_id: browserSessionId,
      })

      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/track-session-end', body)
        } else {
          fetch('/api/track-session-end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
          }).catch(() => {})
        }
      } catch {}
    }

    window.addEventListener('pagehide', sendEndBeacon)
    window.addEventListener('beforeunload', sendEndBeacon)

    return () => {
      window.removeEventListener('pagehide', sendEndBeacon)
      window.removeEventListener('beforeunload', sendEndBeacon)
    }
  }, [pathname])

  return null
}
