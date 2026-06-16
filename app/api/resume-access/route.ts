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
<div style="font-family: Georgia, serif; max-width: 720px; margin: 0 auto; padding: 48px 32px; background: #ddd2cf; background: linear-gradient(135deg, #e8e6f0 0%, #ddd2cf 50%, #c9b4b0 100%); color: #2a2a2a; line-height: 1.7;">

  <!-- Greeting -->
  <div style="font-size: 18px; margin-bottom: 24px;">
    Hi Hamza,
  </div>

  <!-- Opening paragraph -->
  <div style="font-size: 15px; margin-bottom: 28px;">
    A new resume access request has just landed in your inbox. Here are the details for your review.
  </div>

  <!-- Request details card -->
  <div style="background: rgba(255,255,255,0.5); border: 1px solid rgba(42,42,42,0.2); border-radius: 4px; padding: 20px 24px; margin: 24px 0;">
    <div style="font-size: 14px; margin-bottom: 12px;">
      <strong>Name:</strong> ${escape(data.fullName)}
    </div>
    <div style="font-size: 14px; margin-bottom: 12px;">
      <strong>Email:</strong> ${escape(data.workEmail)}
    </div>
    <div style="font-size: 14px; margin-bottom: ${data.phone || data.reason ? '12px' : '0'};">
      <strong>Company:</strong> ${escape(data.company)}
    </div>
    ${
      data.phone
        ? `<div style="font-size: 14px; margin-bottom: ${data.reason ? '12px' : '0'};">
            <strong>Phone:</strong> ${escape(data.phone)}
          </div>`
        : ''
    }
    ${
      data.reason
        ? `<div style="font-size: 14px; margin-bottom: 0;">
            <strong>Reason:</strong> ${escape(data.reason)}
          </div>`
        : ''
    }
  </div>

  <!-- Approve / Decline button row -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 32px 0; border-collapse: separate; border-spacing: 4px 0;">
    <tr>
      <td style="width: 50%;">
        <a href="${data.approveUrl}" style="display: block; background: #2a2a2a; color: #ffffff; padding: 14px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 14px; text-decoration: none; font-weight: 500;">
          Approve Request
        </a>
      </td>
      <td style="width: 50%;">
        <a href="${data.rejectUrl}" style="display: block; background: rgba(255,255,255,0.6); color: #2a2a2a; border: 1px solid #2a2a2a; padding: 13px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 14px; text-decoration: none;">
          Decline Request
        </a>
      </td>
    </tr>
  </table>

  <!-- Instructional text -->
  <div style="font-size: 14px; margin: 32px 0 20px 0;">
    Approving will send the requester a secure 24-hour download link along with your portfolio resources. Declining will send a polite decline message. Either way, the request will be marked as resolved in your dashboard.
  </div>

  <!-- Automated disclaimer footer -->
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed rgba(42,42,42,0.3); font-family: Georgia, serif; font-size: 11px; color: rgba(42,42,42,0.6); line-height: 1.6; font-style: italic;">
    This email was sent automatically when a new resume access request was submitted via hamzaqureshi.dev/connect.
  </div>

</div>
  `.trim()
}
