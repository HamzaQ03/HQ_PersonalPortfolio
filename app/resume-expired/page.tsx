'use client'

import Link from 'next/link'

export default function ResumeExpiredPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#f5e8d4',
        fontFamily: 'Georgia, serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '48px 36px',
          background: '#1a1410',
          border: '1px solid #c8a87c',
          borderRadius: '4px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '11px',
            letterSpacing: '2.5px',
            color: '#c8a87c',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          HQ Portfolio · Resume Access
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontStyle: 'italic',
            color: '#f5e8d4',
            marginBottom: '20px',
            fontWeight: 'normal',
          }}
        >
          Link Expired
        </h1>

        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.7,
            color: '#ead7b8',
            marginBottom: '32px',
          }}
        >
          This download link has expired or is no longer valid. Resume access
          links are time-limited for security.
          <br />
          <br />
          If you still need access, please request it again through the Connect
          page.
        </p>

        <Link
          href="/connect"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: '#c8a87c',
            color: '#0a0a0a',
            fontFamily: "'Courier New', monospace",
            fontSize: '13px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            textDecoration: 'none',
            borderRadius: '2px',
          }}
        >
          Request Access Again
        </Link>
      </div>
    </div>
  )
}
