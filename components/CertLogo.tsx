'use client'

import * as si from 'simple-icons'
import Image from 'next/image'

interface CertLogoProps {
  certName?: string
  issuer: string
  size?: number
}

export default function CertLogo({
  certName = '',
  issuer,
  size = 40,
}: CertLogoProps) {
  const lowerCert   = certName.toLowerCase()
  const lowerIssuer = issuer.toLowerCase()

  // ── LOCAL IMAGE LOGOS ────────────────────────────────────

  // NIH Public Trust Clearance
  if (
    lowerCert.includes('public trust') ||
    lowerCert.includes('clearance') ||
    lowerIssuer.includes('nih') ||
    lowerIssuer.includes('national institutes of health')
  ) {
    return (
      <div style={wrapStyle(size)}>
        <Image
          src="/NIH_Logo.png"
          alt="NIH"
          width={size}
          height={size}
          style={{ objectFit: 'contain', maxWidth: size, maxHeight: size }}
        />
      </div>
    )
  }

  // CISA
  if (lowerCert.includes('cisa') || lowerCert.includes('certified information systems auditor')) {
    return (
      <div style={wrapStyle(size)}>
        <Image
          src="/CISA_Logo.png"
          alt="CISA"
          width={size}
          height={size}
          style={{ objectFit: 'contain', maxWidth: size, maxHeight: size }}
        />
      </div>
    )
  }

  // CISM
  if (lowerCert.includes('cism') || lowerCert.includes('certified information security manager')) {
    return (
      <div style={wrapStyle(size)}>
        <Image
          src="/CISM_Logo.png"
          alt="CISM"
          width={size}
          height={size}
          style={{ objectFit: 'contain', maxWidth: size, maxHeight: size }}
        />
      </div>
    )
  }

  // AWS
  if (lowerIssuer.includes('aws') || lowerIssuer.includes('amazon')) {
    return (
      <div style={wrapStyle(size)}>
        <Image
          src="/AWS_4th_Logo.jpeg"
          alt="AWS"
          width={size}
          height={size}
          style={{ objectFit: 'contain', maxWidth: size, maxHeight: size }}
        />
      </div>
    )
  }

  // CompTIA
  if (lowerIssuer.includes('comptia')) {
    return (
      <div style={wrapStyle(size)}>
        <Image
          src="/Comptia_logo_2nd.png"
          alt="CompTIA"
          width={size}
          height={size}
          style={{ objectFit: 'contain', maxWidth: size, maxHeight: size }}
        />
      </div>
    )
  }

  // ── SIMPLE-ICONS LOGOS ───────────────────────────────────

  // Microsoft / Azure — four-square inline SVG
  if (lowerIssuer.includes('microsoft') || lowerIssuer.includes('azure')) {
    return (
      <div style={wrapStyle(size)}>
        <svg width={size} height={size} viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
          <rect x="0"  y="0"  width="10" height="10" fill="#F25022" />
          <rect x="11" y="0"  width="10" height="10" fill="#7FBA00" />
          <rect x="0"  y="11" width="10" height="10" fill="#00A4EF" />
          <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
        </svg>
      </div>
    )
  }

  // ISC²
  if (lowerIssuer.includes('isc')) {
    return renderSimpleIcon(si.siIsc2, size)
  }

  return null
}

// ── Helpers ──────────────────────────────────────────────

function wrapStyle(size: number): React.CSSProperties {
  return {
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
}

function renderSimpleIcon(logo: any, size: number) {
  if (!logo) return null
  return (
    <div style={wrapStyle(size)}>
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        fill={`#${logo.hex}`}
      >
        <title>{logo.title}</title>
        <path d={logo.path} />
      </svg>
    </div>
  )
}
