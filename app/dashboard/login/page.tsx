'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/dashboard-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Authentication failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'rgba(10,10,10,0.95)',
        border: '2px solid #c8a87c',
        borderRadius: 8,
        padding: 40,
        boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(200,168,124,0.15)',
      }}>
        <p style={{
          fontFamily: 'monospace',
          fontSize: 10,
          letterSpacing: 2,
          color: '#c8a87c',
          opacity: 0.7,
          margin: '0 0 8px',
        }}>
          HAMZA QURESHI · PORTFOLIO
        </p>
        <h1 style={{
          fontFamily: 'var(--font-space-grotesk), sans-serif',
          fontSize: 24,
          fontWeight: 700,
          color: '#f5e8d4',
          margin: '0 0 6px',
          letterSpacing: 0.5,
        }}>
          Admin Dashboard
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: 'rgba(245,232,212,0.5)',
          margin: '0 0 28px',
        }}>
          Restricted access. Enter password to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(200,168,124,0.06)',
              border: '1px solid rgba(200,168,124,0.3)',
              borderRadius: 4,
              color: '#f5e8d4',
              fontFamily: 'monospace',
              fontSize: 14,
              letterSpacing: 1,
              outline: 'none',
              marginBottom: 16,
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <p style={{
              fontFamily: 'monospace',
              fontSize: 11,
              color: '#ff6b6b',
              margin: '0 0 16px',
              letterSpacing: 0.5,
            }}>
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !password}
            style={{
              width: '100%',
              padding: '14px',
              background: submitting ? 'rgba(200,168,124,0.3)' : '#c8a87c',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: 4,
              fontFamily: 'var(--font-space-grotesk), sans-serif',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 200ms',
            }}
          >
            {submitting ? 'AUTHENTICATING...' : 'UNLOCK DASHBOARD'}
          </button>
        </form>
      </div>
    </div>
  )
}
