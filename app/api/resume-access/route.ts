import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// Blocklist of disposable / temporary email services only. Free
// providers (Gmail, Yahoo, Outlook, etc.) are accepted — the gate
// is human review, not email-provider class.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'tempmail.com',
  'temp-mail.org',
  'throwaway.email',
  'sharklasers.com',
  'getairmail.com',
  'mailcatch.com',
  'maildrop.cc',
  'mintemail.com',
  'mohmal.com',
  'spamgourmet.com',
  'tempinbox.com',
  'trashmail.com',
  'yopmail.com',
  'dispostable.com',
  'fakeinbox.com',
  'spambox.us',
  'mailnesia.com',
])

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      fullName = '',
      workEmail = '',
      company = '',
      phone = '',
      reason = '',
    } = body || {}

    const trimmedName = String(fullName).trim()
    const trimmedEmail = String(workEmail).trim().toLowerCase()
    const trimmedCompany = String(company).trim()

    if (!trimmedName || !trimmedEmail || !trimmedCompany) {
      return NextResponse.json(
        { ok: false, error: 'Please fill in all required fields.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const emailDomain = trimmedEmail.split('@')[1]
    if (DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Please use a valid email address. Disposable or temporary email services are not accepted.',
        },
        { status: 400 }
      )
    }

    if (
      trimmedName.length > 100 ||
      trimmedCompany.length > 200 ||
      String(reason).length > 1000
    ) {
      return NextResponse.json(
        { ok: false, error: 'One of your fields exceeds the maximum length.' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: insertData, error: dbError } = await supabase
      .from('resume_access_requests')
      .insert({
        full_name: trimmedName,
        work_email: trimmedEmail,
        company: trimmedCompany,
        phone: String(phone).trim() || null,
        reason: String(reason).trim() || null,
        status: 'pending',
      })
      .select('id')
      .single()

    if (dbError || !insertData) {
      console.error('[resume-access] Supabase error:', dbError)
      return NextResponse.json(
        { ok: false, error: 'Could not save your request. Please try again.' },
        { status: 500 }
      )
    }

    const requestId = insertData.id

    // Send admin notification email via Resend HTTP API (Edge-compatible).
    // Best-effort: if it fails the request is still saved in Supabase.
    const resendKey = process.env.RESEND_API_KEY
    const adminEmail = process.env.APPROVAL_EMAIL || 'moehamzza@gmail.com'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const secret = process.env.APPROVAL_SECRET

    if (resendKey && secret) {
      const approveUrl = `${siteUrl}/api/resume-access-approve?id=${requestId}&secret=${secret}`
      const rejectUrl = `${siteUrl}/api/resume-access-reject?id=${requestId}&secret=${secret}`

      const adminHtml = buildAdminEmailHtml({
        fullName: trimmedName,
        workEmail: trimmedEmail,
        company: trimmedCompany,
        phone: String(phone).trim(),
        reason: String(reason).trim(),
        requestId,
        approveUrl,
        rejectUrl,
      })

      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_SENDER || 'Portfolio <onboarding@resend.dev>',
            to: [adminEmail],
            reply_to: trimmedEmail,
            subject: `Resume access request from ${trimmedName} at ${trimmedCompany}`,
            html: adminHtml,
          }),
        })
      } catch (err) {
        console.error('[resume-access] Admin email failed:', err)
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Request received. You'll receive an email response within 24 hours.",
    })
  } catch (err) {
    console.error('[resume-access] Unexpected error:', err)
    return NextResponse.json(
      { ok: false, error: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}

function buildAdminEmailHtml(data: {
  fullName: string
  workEmail: string
  company: string
  phone: string
  reason: string
  requestId: string
  approveUrl: string
  rejectUrl: string
}): string {
  const escape = (s: string) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  return `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 30px; background: #0a0a0a; color: #f5e8d4;">
  <div style="border-bottom: 1px solid #c8a87c; padding-bottom: 16px; margin-bottom: 24px;">
    <div style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 2px; color: #c8a87c; text-transform: uppercase;">
      HQ Portfolio · Resume Access Request
    </div>
    <div style="font-size: 22px; margin-top: 8px; font-style: italic; color: #f5e8d4;">
      New resume access request
    </div>
  </div>

  <div style="margin-bottom: 18px;">
    <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #c8a87c; letter-spacing: 1.5px; text-transform: uppercase;">From</div>
    <div style="font-size: 16px; margin-top: 4px;">${escape(data.fullName)}</div>
  </div>

  <div style="margin-bottom: 18px;">
    <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #c8a87c; letter-spacing: 1.5px; text-transform: uppercase;">Company</div>
    <div style="font-size: 16px; margin-top: 4px;">${escape(data.company)}</div>
  </div>

  <div style="margin-bottom: 18px;">
    <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #c8a87c; letter-spacing: 1.5px; text-transform: uppercase;">Work Email</div>
    <div style="font-size: 16px; margin-top: 4px;">
      <a href="mailto:${escape(data.workEmail)}" style="color: #f5e8d4;">${escape(data.workEmail)}</a>
    </div>
  </div>

  ${
    data.phone
      ? `<div style="margin-bottom: 18px;">
          <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #c8a87c; letter-spacing: 1.5px; text-transform: uppercase;">Phone</div>
          <div style="font-size: 16px; margin-top: 4px;">${escape(data.phone)}</div>
        </div>`
      : ''
  }

  ${
    data.reason
      ? `<div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #c8a87c;">
          <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #c8a87c; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">Reason for request</div>
          <div style="font-size: 15px; line-height: 1.7; white-space: pre-wrap; font-style: italic; color: #ead7b8;">${escape(data.reason)}</div>
        </div>`
      : ''
  }

  <div style="margin-top: 36px; text-align: center;">
    <a href="${data.approveUrl}" style="display: inline-block; padding: 14px 28px; background: #c8a87c; color: #0a0a0a; font-family: 'Courier New', monospace; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; border-radius: 2px; margin-right: 8px;">
      ✅ Approve &amp; Send Link
    </a>
    <a href="${data.rejectUrl}" style="display: inline-block; padding: 14px 28px; background: transparent; color: #f5e8d4; border: 1px solid #c8a87c; font-family: 'Courier New', monospace; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; border-radius: 2px; margin-left: 8px;">
      🗑 Reject Request
    </a>
  </div>

  <div style="margin-top: 32px; font-family: 'Courier New', monospace; font-size: 10px; color: #8a7960; letter-spacing: 1.5px; text-align: center;">
    Request ID: ${escape(data.requestId)}
  </div>
</div>
  `.trim()
}
