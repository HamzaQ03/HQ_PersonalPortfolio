'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────────
type Session = {
  id: string
  visitor_id: string
  started_at: string
  last_activity: string
  visit_number: number
  location: string | null
  isp: string | null
  timezone: string | null
  language: string | null
  os: string | null
  browser: string | null
  device: string | null
  ip: string | null
  referrer: string | null
  clicks: Array<{ target: string; page: string; at: string }> | null
}

type PageView = {
  id: string
  session_id: string
  page: string
  viewed_at: string
}

type Review = {
  id: string
  created_at: string
  name: string
  reviewer_email: string | null
  profession: string | null
  company: string | null
  connection: string | null
  rating: number
  review_text: string
  approved: boolean | null
  recommendation_letter_url: string | null
}

type Message = {
  id: string
  created_at: string
  full_name: string
  email: string
  phone: string | null
  company: string | null
  message: string
}

type ResumeRequest = {
  id: string
  created_at: string
  full_name: string
  email: string
  company: string | null
  reason: string | null
  approved: boolean | null
}

type Tab = 'visits' | 'reviews' | 'messages' | 'resume'

// ── Constants ──────────────────────────────────────────────────────────────────
const T    = '#f0f0f0'
const A    = '#c8a87c'
const TM   = '#666677'

// ── Helpers ────────────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s    = Math.floor(diff / 1000)
  if (s < 60)    return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60)    return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)    return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}


// ── Main dashboard (access gated by middleware.ts) ─────────────────────────────
function DashboardInner() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [pageViewsBySession, setPageViewsBySession] = useState<Record<string, PageView[]>>({})
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)
  const [reviews,   setReviews]   = useState<Review[]>([])
  const [messages,  setMessages]  = useState<Message[]>([])
  const [resumeReqs, setResumeReqs] = useState<ResumeRequest[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('visits')
  const [clock,     setClock]     = useState('')

  // ── Live clock ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour12: false }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  // ── Fetch all four data sources ──────────────────────────────────────────────
  // Each fetch is independent — if one table doesn't exist or RLS blocks it,
  // the others still load. Errors are logged but don't crash the tab.
  const fetchAll = useCallback(async () => {
    try {
      const { data: sessionRows } = await supabase
        .from('sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100)
      if (sessionRows) setSessions(sessionRows as Session[])
    } catch (err) {
      console.error('[dashboard] sessions fetch failed:', err)
    }

    try {
      const { data: pvRows } = await supabase
        .from('page_views')
        .select('*')
        .order('viewed_at', { ascending: true })
        .limit(1000)
      if (pvRows) {
        const grouped: Record<string, PageView[]> = {}
        for (const pv of pvRows as PageView[]) {
          if (!grouped[pv.session_id]) grouped[pv.session_id] = []
          grouped[pv.session_id].push(pv)
        }
        setPageViewsBySession(grouped)
      }
    } catch (err) {
      console.error('[dashboard] page_views fetch failed:', err)
    }

    try {
      const { data } = await supabase
        .from('reviews')
        .select('id, created_at, name, reviewer_email, profession, company, connection, rating, review_text, approved, recommendation_letter_url')
        .order('created_at', { ascending: false })
        .limit(100)
      if (data) setReviews(data as Review[])
    } catch (err) {
      console.error('[dashboard] reviews fetch failed:', err)
    }

    try {
      const { data } = await supabase
        .from('portfolio_direct_messages')
        .select('id, created_at, full_name, email, phone, company, message')
        .order('created_at', { ascending: false })
        .limit(100)
      if (data) setMessages(data as Message[])
    } catch (err) {
      console.error('[dashboard] messages fetch failed:', err)
    }

    try {
      const { data } = await supabase
        .from('resume_access_requests')
        .select('id, created_at, full_name, email, company, reason, approved')
        .order('created_at', { ascending: false })
        .limit(100)
      if (data) setResumeReqs(data as ResumeRequest[])
    } catch (err) {
      console.error('[dashboard] resume requests fetch failed:', err)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const t = setInterval(fetchAll, 60_000)
    return () => clearInterval(t)
  }, [fetchAll])

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: T, paddingBottom: 60 }}>
      <style>{`
        @keyframes db-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .db-shimmer {
          background: linear-gradient(90deg,
            rgba(200,168,124,0.05) 25%,
            rgba(200,168,124,0.10) 50%,
            rgba(200,168,124,0.05) 75%);
          background-size: 200% 100%;
          animation: db-shimmer 1.5s ease-in-out infinite;
          border-radius: 6px;
        }
        .db-row:hover { background: rgba(200,168,124,0.03); }
        .db-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(200,168,124,0.2);
          border-radius: 6px;
          color: ${T};
          font-family: monospace;
          font-size: 10px;
          padding: 5px 10px;
          outline: none;
          letter-spacing: 1px;
        }
        .db-select option { background: #0a0a0a; }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid rgba(200,168,124,0.1)',
        padding:      '24px 32px',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
        flexWrap:     'wrap',
        gap:          12,
      }}>
        <div>
          <h1 style={{
            fontFamily:    'var(--font-space-grotesk)',
            fontWeight:    700,
            fontSize:      28,
            color:         T,
            letterSpacing: 4,
            margin:        0,
          }}>HQ ANALYTICS</h1>
          <p style={{
            fontFamily:    'monospace',
            fontSize:      11,
            color:         'rgba(200,168,124,0.6)',
            letterSpacing: 1,
            margin:        '4px 0 0',
          }}>Portfolio Intelligence Dashboard</p>
        </div>
        <span style={{
          fontFamily:    'monospace',
          fontSize:      12,
          color:         'rgba(200,168,124,0.7)',
          letterSpacing: 2,
        }}>{clock}</span>
      </div>

      <div style={{ padding: '32px 32px 0' }}>

        {/* ── Tab navigation + logout ─────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          flexWrap: 'wrap',
          borderBottom: '1px solid rgba(200,168,124,0.2)',
          paddingBottom: 12,
        }}>
          {([
            { id: 'visits',   label: 'SESSIONS',         count: sessions.length },
            { id: 'reviews',  label: 'REVIEWS',          count: reviews.length },
            { id: 'messages', label: 'MESSAGES',         count: messages.length },
            { id: 'resume',   label: 'RESUME REQUESTS',  count: resumeReqs.length },
          ] as { id: Tab; label: string; count: number }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                background: activeTab === tab.id ? 'rgba(200,168,124,0.15)' : 'transparent',
                color: activeTab === tab.id ? '#f5e8d4' : 'rgba(200,168,124,0.6)',
                border: `1px solid ${activeTab === tab.id ? '#c8a87c' : 'rgba(200,168,124,0.3)'}`,
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: 11,
                letterSpacing: 1.5,
                transition: 'all 200ms',
              }}
            >
              {tab.label} · {tab.count}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          <button
            onClick={async () => {
              await fetch('/api/dashboard-auth', { method: 'DELETE' })
              window.location.href = '/dashboard/login'
            }}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: 'rgba(255,107,107,0.7)',
              border: '1px solid rgba(255,107,107,0.4)',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 11,
              letterSpacing: 1.5,
              transition: 'all 200ms',
            }}
          >
            ↗ LOG OUT
          </button>
        </div>

        {activeTab === 'visits' && (
          <div style={{ display: 'grid', gap: 10 }}>
            {sessions.length === 0 ? (
              <p style={{ color: TM, fontFamily: 'monospace', fontSize: 12 }}>No sessions yet.</p>
            ) : sessions.map((s) => {
              const expanded = expandedSessionId === s.id
              const pages = pageViewsBySession[s.id] || []
              const start = new Date(s.started_at).getTime()
              const end = new Date(s.last_activity).getTime()
              const durationMs = Math.max(0, end - start)
              const durationMin = Math.floor(durationMs / 60000)
              const durationSec = Math.floor((durationMs % 60000) / 1000)
              const durationLabel = durationMin > 0 ? `${durationMin}m ${durationSec}s` : `${durationSec}s`

              return (
                <div key={s.id} style={{
                  padding: 14,
                  background: 'rgba(10,10,10,0.8)',
                  border: '1px solid rgba(200,168,124,0.2)',
                  borderRadius: 6,
                }}>
                  <div
                    onClick={() => setExpandedSessionId(expanded ? null : s.id)}
                    style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
                  >
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <p style={{ color: T, fontSize: 13, fontWeight: 600, margin: 0 }}>
                        Visitor #{s.visitor_id.slice(0, 6)} · Visit #{s.visit_number}
                      </p>
                      <p style={{ color: TM, fontSize: 11, fontFamily: 'monospace', margin: '4px 0 0' }}>
                        {s.location || 'Unknown'} · {s.os || '—'} · {s.browser || '—'} · {s.device || '—'}
                      </p>
                      <p style={{ color: TM, fontSize: 10, fontFamily: 'monospace', margin: '4px 0 0' }}>
                        {s.referrer && s.referrer !== 'direct' ? `From: ${s.referrer}` : 'Direct visit'}
                        {s.isp && s.isp !== 'Unknown' ? ` · ISP: ${s.isp}` : ''}
                        {s.language ? ` · ${s.language}` : ''}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 120 }}>
                      <p style={{ color: A, fontSize: 11, fontFamily: 'monospace', margin: 0 }}>
                        {pages.length} page{pages.length === 1 ? '' : 's'} · {durationLabel}
                      </p>
                      <p style={{ color: TM, fontSize: 10, fontFamily: 'monospace', margin: '4px 0 0' }}>
                        {relativeTime(s.started_at)}
                      </p>
                      {Array.isArray(s.clicks) && s.clicks.length > 0 && (
                        <p style={{ color: '#22c55e', fontSize: 10, fontFamily: 'monospace', margin: '4px 0 0' }}>
                          {s.clicks.length} click{s.clicks.length === 1 ? '' : 's'}
                        </p>
                      )}
                    </div>
                  </div>

                  {expanded && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(200,168,124,0.2)' }}>
                      <p style={{ color: A, fontSize: 10, fontFamily: 'monospace', margin: '0 0 6px', letterSpacing: 1 }}>PAGES</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {pages.map((pv) => (
                          <span key={pv.id} style={{
                            padding: '3px 8px',
                            background: 'rgba(200,168,124,0.1)',
                            border: '1px solid rgba(200,168,124,0.3)',
                            borderRadius: 3,
                            color: '#d4c4a8',
                            fontFamily: 'monospace',
                            fontSize: 10,
                          }}>
                            {pv.page}
                          </span>
                        ))}
                      </div>

                      {Array.isArray(s.clicks) && s.clicks.length > 0 && (
                        <>
                          <p style={{ color: A, fontSize: 10, fontFamily: 'monospace', margin: '0 0 6px', letterSpacing: 1 }}>CLICKS</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {s.clicks.map((c, i) => (
                              <span key={i} style={{
                                padding: '3px 8px',
                                background: 'rgba(34,197,94,0.1)',
                                border: '1px solid rgba(34,197,94,0.3)',
                                borderRadius: 3,
                                color: '#86efac',
                                fontFamily: 'monospace',
                                fontSize: 10,
                              }}>
                                {c.target} · {c.page}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}


        {/* ── Reviews tab ─────────────────────────────────────────────────── */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {reviews.length === 0 ? (
              <p style={{ color: TM, fontFamily: 'monospace', fontSize: 12 }}>No reviews yet.</p>
            ) : reviews.map(r => (
              <div key={r.id} style={{
                padding: 16,
                background: 'rgba(10,10,10,0.8)',
                border: `1px solid ${r.approved ? 'rgba(34,197,94,0.3)' : 'rgba(200,168,124,0.2)'}`,
                borderRadius: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ color: T, fontSize: 14, fontWeight: 600, margin: 0 }}>{r.name}</p>
                    <p style={{ color: TM, fontSize: 11, margin: '2px 0 0' }}>
                      {r.profession || '—'} · {r.company || '—'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#ffc107', fontSize: 13, margin: 0 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
                    <p style={{ color: TM, fontSize: 10, fontFamily: 'monospace', margin: '2px 0 0' }}>{relativeTime(r.created_at)}</p>
                  </div>
                </div>
                <p style={{ color: '#d4c4a8', fontSize: 13, lineHeight: 1.6, margin: '8px 0', fontStyle: 'italic' }}>&ldquo;{r.review_text}&rdquo;</p>
                <div style={{ display: 'flex', gap: 8, fontSize: 10, fontFamily: 'monospace', color: TM, flexWrap: 'wrap' }}>
                  <span>{r.approved ? '✓ APPROVED' : '⏳ PENDING'}</span>
                  {r.reviewer_email && <span>· {r.reviewer_email}</span>}
                  {r.recommendation_letter_url && (
                    <a href={r.recommendation_letter_url} target="_blank" rel="noopener noreferrer" style={{ color: A }}>↓ Letter</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Messages tab ────────────────────────────────────────────────── */}
        {activeTab === 'messages' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {messages.length === 0 ? (
              <p style={{ color: TM, fontFamily: 'monospace', fontSize: 12 }}>No messages yet.</p>
            ) : messages.map(m => (
              <div key={m.id} style={{
                padding: 16,
                background: 'rgba(10,10,10,0.8)',
                border: '1px solid rgba(200,168,124,0.2)',
                borderRadius: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ color: T, fontSize: 14, fontWeight: 600, margin: 0 }}>{m.full_name}</p>
                    <p style={{ color: A, fontSize: 11, fontFamily: 'monospace', margin: '2px 0 0' }}>
                      <a href={`mailto:${m.email}`} style={{ color: A }}>{m.email}</a>
                      {m.phone && <span> · {m.phone}</span>}
                      {m.company && <span> · {m.company}</span>}
                    </p>
                  </div>
                  <p style={{ color: TM, fontSize: 10, fontFamily: 'monospace', margin: 0 }}>{relativeTime(m.created_at)}</p>
                </div>
                <p style={{ color: '#d4c4a8', fontSize: 13, lineHeight: 1.6, margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{m.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Resume requests tab ─────────────────────────────────────────── */}
        {activeTab === 'resume' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {resumeReqs.length === 0 ? (
              <p style={{ color: TM, fontFamily: 'monospace', fontSize: 12 }}>No resume requests yet.</p>
            ) : resumeReqs.map(rr => (
              <div key={rr.id} style={{
                padding: 16,
                background: 'rgba(10,10,10,0.8)',
                border: `1px solid ${rr.approved ? 'rgba(34,197,94,0.3)' : 'rgba(200,168,124,0.2)'}`,
                borderRadius: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ color: T, fontSize: 14, fontWeight: 600, margin: 0 }}>{rr.full_name}</p>
                    <p style={{ color: A, fontSize: 11, fontFamily: 'monospace', margin: '2px 0 0' }}>
                      <a href={`mailto:${rr.email}`} style={{ color: A }}>{rr.email}</a>
                      {rr.company && <span> · {rr.company}</span>}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, fontFamily: 'monospace', margin: 0, color: rr.approved === true ? '#22c55e' : rr.approved === false ? '#ff6b6b' : '#c8a87c' }}>
                      {rr.approved === true ? '✓ APPROVED' : rr.approved === false ? '✗ DECLINED' : '⏳ PENDING'}
                    </p>
                    <p style={{ color: TM, fontSize: 10, fontFamily: 'monospace', margin: '2px 0 0' }}>{relativeTime(rr.created_at)}</p>
                  </div>
                </div>
                {rr.reason && (
                  <p style={{ color: '#d4c4a8', fontSize: 13, lineHeight: 1.6, margin: '8px 0 0', fontStyle: 'italic' }}>&ldquo;{rr.reason}&rdquo;</p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

// ── Page export — wraps inner in Suspense (required for useSearchParams) ───────
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(200,168,124,0.4)', letterSpacing: 2 }}>
          LOADING...
        </span>
      </div>
    }>
      <DashboardInner />
    </Suspense>
  )
}
