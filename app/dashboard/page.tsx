'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────────
type Visit = {
  id: string
  page: string
  country: string | null
  city: string | null
  device: string | null
  browser: string | null
  referrer: string | null
  ip: string | null
  created_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────────
const T    = '#f0f0f0'
const A    = '#c8a87c'
const TM   = '#666677'
const ROWS = 50

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

function topByField(data: Visit[], field: keyof Visit): string {
  const counts: Record<string, number> = {}
  data.forEach(v => { const val = v[field] || 'Unknown'; counts[val] = (counts[val] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
}

function startOfDay(): Date {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d
}

function startOfWeek(): Date {
  const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0, 0, 0, 0); return d
}

function startOfMonth(): Date {
  const d = new Date(); d.setDate(d.getDate() - 30); d.setHours(0, 0, 0, 0); return d
}

// ── Skeleton card ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background:   'rgba(10,10,10,0.8)',
      border:       '1px solid rgba(200,168,124,0.15)',
      borderRadius: 12,
      padding:      24,
    }}>
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
      `}</style>
      <div className="db-shimmer" style={{ height: 36, width: '60%', marginBottom: 10 }} />
      <div className="db-shimmer" style={{ height: 10, width: '40%' }} />
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{
      background:   'rgba(10,10,10,0.8)',
      border:       '1px solid rgba(200,168,124,0.15)',
      borderRadius: 12,
      padding:      '20px 24px',
      flex:         1,
    }}>
      <p style={{
        fontFamily:    'var(--font-space-grotesk)',
        fontWeight:    700,
        fontSize:      32,
        color:         T,
        margin:        0,
        letterSpacing: 1,
        lineHeight:    1.1,
        wordBreak:     'break-all',
      }}>{value}</p>
      <p style={{
        fontFamily:    'monospace',
        fontSize:      10,
        color:         'rgba(200,168,124,0.6)',
        letterSpacing: 2,
        margin:        '6px 0 0',
      }}>{label}</p>
    </div>
  )
}

// ── Filter button ──────────────────────────────────────────────────────────────
function FilterBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily:    'monospace',
        fontSize:      10,
        letterSpacing: 1,
        padding:       '5px 12px',
        borderRadius:  6,
        border:        `1px solid ${active ? A : 'rgba(200,168,124,0.2)'}`,
        background:    active ? 'rgba(200,168,124,0.12)' : 'transparent',
        color:         active ? A : TM,
        transition:    'all 150ms',
      }}
    >
      {children}
    </button>
  )
}

// ── Main dashboard (inner — uses useSearchParams) ──────────────────────────────
function DashboardInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // ── Security gate ────────────────────────────────────────────────────────────
  useEffect(() => {
    const key = searchParams.get('key')
    if (key !== 'hq-portfolio-access') router.replace('/')
  }, [searchParams, router])

  const [visits,    setVisits]    = useState<Visit[]>([])
  const [loading,   setLoading]   = useState(true)
  const [clock,     setClock]     = useState('')
  const [page,      setPage]      = useState(0)

  // Filters
  const [fPage,    setFPage]    = useState('all')
  const [fCountry, setFCountry] = useState('all')
  const [fDevice,  setFDevice]  = useState('all')
  const [fDate,    setFDate]    = useState<'today'|'week'|'month'|'all'>('all')

  // ── Live clock ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour12: false }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  // ── Fetch data ───────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from('visits')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setVisits(data as Visit[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const t = setInterval(fetchData, 60_000)
    return () => clearInterval(t)
  }, [fetchData])

  // ── Derived stats ────────────────────────────────────────────────────────────
  const todayStart = startOfDay().getTime()
  const weekStart  = startOfWeek().getTime()
  const monthStart = startOfMonth().getTime()

  const totalVisits   = visits.length
  const todayVisits   = visits.filter(v => new Date(v.created_at).getTime() >= todayStart).length
  const weekVisits    = visits.filter(v => new Date(v.created_at).getTime() >= weekStart).length
  const topPage       = topByField(visits, 'page')
  const topCountry    = topByField(visits, 'country')
  const topDevice     = topByField(visits, 'device')

  // ── Unique filter values ─────────────────────────────────────────────────────
  const uniquePages     = ['all', ...Array.from(new Set(visits.map(v => v.page))).sort()]
  const uniqueCountries = ['all', ...Array.from(new Set(visits.map(v => v.country || 'Unknown'))).sort()]

  // ── Apply filters ─────────────────────────────────────────────────────────────
  const filtered = visits.filter(v => {
    if (fPage    !== 'all' && v.page                     !== fPage)    return false
    if (fCountry !== 'all' && (v.country || 'Unknown')   !== fCountry) return false
    if (fDevice  !== 'all' && (v.device  || 'Unknown')   !== fDevice)  return false
    if (fDate === 'today' && new Date(v.created_at).getTime() < todayStart) return false
    if (fDate === 'week'  && new Date(v.created_at).getTime() < weekStart)  return false
    if (fDate === 'month' && new Date(v.created_at).getTime() < monthStart) return false
    return true
  })

  // ── Pagination ───────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ROWS)
  const pageData   = filtered.slice(page * ROWS, page * ROWS + ROWS)

  function clearFilters() {
    setFPage('all'); setFCountry('all'); setFDevice('all'); setFDate('all'); setPage(0)
  }

  // Security: don't render anything if key is wrong
  if (searchParams.get('key') !== 'hq-portfolio-access') return null

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

        {/* ── Row 1: 4 stat cards ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          {loading ? (
            [0,1,2,3].map(i => <div key={i} style={{ flex: 1, minWidth: 140 }}><SkeletonCard /></div>)
          ) : (
            <>
              <StatCard value={totalVisits.toLocaleString()} label="TOTAL VISITS"  />
              <StatCard value={todayVisits.toLocaleString()} label="TODAY"         />
              <StatCard value={topPage}                      label="TOP PAGE"      />
              <StatCard value={topCountry}                   label="TOP COUNTRY"   />
            </>
          )}
        </div>

        {/* ── Row 2: 2 stat cards ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {loading ? (
            [0,1].map(i => <div key={i} style={{ flex: 1, minWidth: 140 }}><SkeletonCard /></div>)
          ) : (
            <>
              <StatCard value={weekVisits.toLocaleString()} label="THIS WEEK"   />
              <StatCard value={topDevice}                   label="TOP DEVICE"  />
              <div style={{ flex: 2 }} />
            </>
          )}
        </div>

        {/* ── Visit log table ──────────────────────────────────────────────── */}
        <div style={{
          background:   'rgba(10,10,10,0.8)',
          border:       '1px solid rgba(200,168,124,0.15)',
          borderRadius: 12,
          overflow:     'hidden',
        }}>
          {/* Table header row */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '16px 20px',
            borderBottom:   '1px solid rgba(200,168,124,0.1)',
            flexWrap:       'wrap',
            gap:            10,
          }}>
            <span style={{
              fontFamily:    'var(--font-space-grotesk)',
              fontWeight:    600,
              fontSize:      14,
              color:         T,
              letterSpacing: 1,
            }}>VISIT LOG</span>
            <button
              onClick={() => { setLoading(true); fetchData() }}
              title="Refresh"
              style={{
                background:  'none',
                border:      '1px solid rgba(200,168,124,0.2)',
                borderRadius: 6,
                color:       A,
                fontSize:    14,
                padding:     '4px 10px',
                transition:  'opacity 150ms',
              }}
            >↺</button>
          </div>

          {/* Filters */}
          <div style={{
            padding:    '12px 20px',
            borderBottom: '1px solid rgba(200,168,124,0.08)',
            display:    'flex',
            flexWrap:   'wrap',
            gap:        10,
            alignItems: 'center',
          }}>
            {/* Page filter */}
            <select className="db-select" value={fPage}
              onChange={e => { setFPage(e.target.value); setPage(0) }}>
              {uniquePages.map(p => (
                <option key={p} value={p}>{p === 'all' ? 'All Pages' : p}</option>
              ))}
            </select>

            {/* Country filter */}
            <select className="db-select" value={fCountry}
              onChange={e => { setFCountry(e.target.value); setPage(0) }}>
              {uniqueCountries.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Countries' : c}</option>
              ))}
            </select>

            {/* Device filter */}
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all','Mobile','Desktop'] as const).map(d => (
                <FilterBtn key={d} active={fDevice === d}
                  onClick={() => { setFDevice(d); setPage(0) }}>
                  {d === 'all' ? 'All Devices' : d}
                </FilterBtn>
              ))}
            </div>

            {/* Date filter */}
            <div style={{ display: 'flex', gap: 6 }}>
              {([
                { val: 'today', label: 'Today'      },
                { val: 'week',  label: 'This Week'  },
                { val: 'month', label: 'This Month' },
                { val: 'all',   label: 'All Time'   },
              ] as const).map(({ val, label }) => (
                <FilterBtn key={val} active={fDate === val}
                  onClick={() => { setFDate(val); setPage(0) }}>
                  {label}
                </FilterBtn>
              ))}
            </div>

            {/* Clear */}
            {(fPage !== 'all' || fCountry !== 'all' || fDevice !== 'all' || fDate !== 'all') && (
              <button onClick={clearFilters} style={{
                fontFamily: 'monospace', fontSize: 10, letterSpacing: 1,
                padding: '5px 12px', borderRadius: 6,
                border: '1px solid rgba(255,80,80,0.3)',
                background: 'transparent', color: 'rgba(255,120,120,0.7)',
                transition: 'all 150ms',
              }}>✕ CLEAR</button>
            )}
          </div>

          {/* Row count */}
          <div style={{
            padding:    '8px 20px',
            borderBottom: '1px solid rgba(200,168,124,0.06)',
            fontFamily: 'monospace',
            fontSize:   10,
            color:      TM,
            letterSpacing: 1,
          }}>
            {loading ? 'Loading...' : filtered.length === 0
              ? 'No visits match your filters'
              : `Showing ${filtered.length === 0 ? 0 : page * ROWS + 1}–${Math.min((page + 1) * ROWS, filtered.length)} of ${filtered.length.toLocaleString()} visits`
            }
          </div>

          {/* Empty state */}
          {!loading && visits.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'monospace', fontSize: 13, color: TM }}>
                No visits recorded yet. Share your portfolio to get started!
              </p>
            </div>
          )}

          {/* Table */}
          {!loading && filtered.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr>
                    {['TIME','PAGE','COUNTRY','CITY','DEVICE','BROWSER','REFERRER'].map(col => (
                      <th key={col} style={{
                        fontFamily:    'monospace',
                        fontSize:      9,
                        color:         'rgba(200,168,124,0.6)',
                        letterSpacing: 2,
                        textAlign:     'left',
                        padding:       '10px 16px',
                        borderBottom:  '1px solid rgba(200,168,124,0.1)',
                        fontWeight:    400,
                        whiteSpace:    'nowrap',
                      }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map(v => (
                    <tr key={v.id} className="db-row" style={{ transition: 'background 100ms' }}>
                      <td style={{ padding: '9px 16px', borderBottom: '1px solid rgba(200,168,124,0.05)' }}>
                        <span
                          title={new Date(v.created_at).toLocaleString()}
                          style={{ fontFamily: 'monospace', fontSize: 11, color: '#e0e0e0', whiteSpace: 'nowrap' }}
                        >
                          {relativeTime(v.created_at)}
                        </span>
                      </td>
                      {[v.page, v.country||'—', v.city||'—', v.device||'—', v.browser||'—', v.referrer||'—'].map((val, i) => (
                        <td key={i} style={{ padding: '9px 16px', borderBottom: '1px solid rgba(200,168,124,0.05)' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize:   11,
                            color:      '#e0e0e0',
                            maxWidth:   180,
                            display:    'inline-block',
                            overflow:   'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }} title={val}>{val}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            12,
              padding:        '14px 20px',
              borderTop:      '1px solid rgba(200,168,124,0.08)',
            }}>
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  fontFamily: 'monospace', fontSize: 11, letterSpacing: 1,
                  padding: '6px 16px', borderRadius: 6,
                  border: '1px solid rgba(200,168,124,0.2)',
                  background: 'transparent',
                  color: page === 0 ? TM : A,
                  opacity: page === 0 ? 0.4 : 1,
                  transition: 'all 150ms',
                }}
              >← PREV</button>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: TM, letterSpacing: 1 }}>
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  fontFamily: 'monospace', fontSize: 11, letterSpacing: 1,
                  padding: '6px 16px', borderRadius: 6,
                  border: '1px solid rgba(200,168,124,0.2)',
                  background: 'transparent',
                  color: page >= totalPages - 1 ? TM : A,
                  opacity: page >= totalPages - 1 ? 0.4 : 1,
                  transition: 'all 150ms',
                }}
              >NEXT →</button>
            </div>
          )}
        </div>
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
