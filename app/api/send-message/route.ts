import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// Supabase client uses the public anon key + the anon role's INSERT
// permission on portfolio_direct_messages (locked down via RLS).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Resend recipient — your inbox. Falls back to the same address the
// approval emails go to.
const TO_EMAIL = process.env.APPROVAL_EMAIL || 'moehamzza@gmail.com'

const escape = (s: string) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      fullName = '',
      email = '',
      phone = '',
      company = '',
      message = '',
    } = body || {}

    const trimmedFullName = String(fullName).trim()
    const trimmedEmail = String(email).trim()
    const trimmedMessage = String(message).trim()

    // Required field validation
    if (!trimmedFullName || !trimmedEmail || !trimmedMessage) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing required fields',
          details: {
            fullName: !trimmedFullName,
            email: !trimmedEmail,
            message: !trimmedMessage,
          },
        },
        { status: 400 }
      )
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Length cap — protect from abuse
    if (trimmedMessage.length > 5000) {
      return NextResponse.json(
        { ok: false, error: 'Message too long' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // STEP 1 — save to Supabase (source of truth)
    const { error: dbError } = await supabase
      .from('portfolio_direct_messages')
      .insert({
        full_name: trimmedFullName,
        email: trimmedEmail,
        phone: String(phone).trim() || null,
        company: String(company).trim() || null,
        message: trimmedMessage,
      })

    if (dbError) {
      console.error('[send-message] Supabase error:', dbError)
      return NextResponse.json(
        { ok: false, error: 'Could not save message' },
        { status: 500 }
      )
    }

    // STEP 2 — send admin notification email via Resend HTTP API.
    // Best-effort: if this fails the message is still persisted in
    // Supabase, so the UI still reports success.
    let emailSent = false
    let emailError: string | null = null

    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      try {
        const adminHtml = buildAdminNotificationEmail({
          fullName: trimmedFullName,
          email: trimmedEmail,
          phone: String(phone).trim(),
          company: String(company).trim(),
          message: trimmedMessage,
        })

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_SENDER || 'Portfolio <onboarding@resend.dev>',
            to: [TO_EMAIL],
            reply_to: trimmedEmail,
            subject: `New message from ${trimmedFullName}`,
            html: adminHtml,
          }),
        })

        if (resendRes.ok) {
          emailSent = true
        } else {
          const errText = await resendRes.text()
          emailError = `Resend status ${resendRes.status}: ${errText}`
          console.error('[send-message] Resend failed:', emailError)
        }
      } catch (err) {
        emailError =
          err instanceof Error ? err.message : 'Unknown email error'
        console.error('[send-message] Resend threw:', err)
      }
    } else {
      emailError = 'RESEND_API_KEY missing'
      console.warn('[send-message] No Resend key configured')
    }

    // STEP 3 — send thank-you email to the user (best-effort)
    if (resendKey) {
      try {
        const firstName = trimmedFullName.split(/\s+/)[0] || 'there'
        const userHtml = buildUserThankYouEmail(firstName)

        const userRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_SENDER || 'Portfolio <onboarding@resend.dev>',
            to: [trimmedEmail],
            reply_to: 'contact@hamzaqureshi.dev',
            subject: 'Thanks for your message',
            html: userHtml,
          }),
        })

        if (!userRes.ok) {
          const errText = await userRes.text()
          console.error(
            '[send-message] User thank-you failed:',
            `Resend status ${userRes.status}: ${errText}`
          )
          // Do NOT fail the request — admin already received the message
        }
      } catch (err) {
        console.error('[send-message] User thank-you threw:', err)
        // Do NOT fail the request
      }
    }

    // Always success when the row saved — the email is a
    // convenience, not the source of truth.
    return NextResponse.json({
      ok: true,
      saved: true,
      emailSent,
      emailError: emailSent ? null : emailError,
    })
  } catch (err) {
    console.error('[send-message] Unexpected error:', err)
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────────────────────
// User-facing thank-you email — mirrors the resume-access
// approval email design exactly: 720px pastel gradient outer
// div, Georgia serif body, no inner card. 3 outlined buttons
// (Portfolio / LinkedIn / Book a Meeting) — no primary CTA
// since there's no resume download to anchor on. Signature
// block + dashed-rule footer match resume-access verbatim.
// ─────────────────────────────────────────────────────────────
function buildUserThankYouEmail(firstName: string): string {
  return `
<div style="font-family: Georgia, serif; max-width: 720px; margin: 0 auto; padding: 48px 32px; background: #ddd2cf; background: linear-gradient(135deg, #e8e6f0 0%, #ddd2cf 50%, #c9b4b0 100%); color: #2a2a2a; line-height: 1.7;">

  <!-- Greeting -->
  <div style="font-size: 18px; margin-bottom: 24px; color: #2a2a2a;">
    Hi ${escape(firstName)},
  </div>

  <!-- Opening paragraph -->
  <div style="font-size: 15px; line-height: 1.7; color: #2a2a2a; margin-bottom: 28px;">
    Thank you for taking the time to reach out. Your message has safely landed in my inbox. I will get back to you within 48 hours, often sooner as I read every single message personally.
  </div>

  <!-- Buttons intro -->
  <div style="font-size: 15px; line-height: 1.7; color: #2a2a2a; margin-bottom: 24px;">
    In the meantime, feel free to explore my portfolio further, connect with me on LinkedIn, or book a meeting directly on my calendar to continue this conversation using the resources below.
  </div>

  <!-- 3-button horizontal layout — table layout for max email-client
       compatibility (Gmail / Outlook / Apple Mail all honor it). -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 32px 0; border-collapse: separate; border-spacing: 4px 0;">
    <tr>
      <td style="width: 33.33%;">
        <a href="https://hamzaqureshi.dev" style="display: block; background: rgba(255,255,255,0.6); color: #2a2a2a; border: 1px solid #2a2a2a; padding: 11px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 13px; text-decoration: none;">
          Portfolio
        </a>
      </td>
      <td style="width: 33.33%;">
        <a href="https://linkedin.com/in/hamza-qureshi-cybersec-professional" style="display: block; background: rgba(255,255,255,0.6); color: #2a2a2a; border: 1px solid #2a2a2a; padding: 11px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 13px; text-decoration: none;">
          LinkedIn
        </a>
      </td>
      <td style="width: 33.33%;">
        <a href="https://calendly.com/hamza-qureshi/30min" style="display: block; background: rgba(255,255,255,0.6); color: #2a2a2a; border: 1px solid #2a2a2a; padding: 11px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 13px; text-decoration: none;">
          Book a Meeting
        </a>
      </td>
    </tr>
  </table>

  <!-- Reply line -->
  <div style="font-size: 15px; line-height: 1.7; color: #2a2a2a; margin: 0 0 32px 0;">
    If anything else comes to mind, feel free to reply to this email.
  </div>

  <!-- Sign-off -->
  <div style="font-size: 15px; line-height: 1.7; color: #2a2a2a; margin-top: 28px;">
    Looking forward to our conversation.
  </div>

  <!-- Best regards -->
  <div style="font-size: 15px; color: #2a2a2a; margin-top: 24px;">
    Best regards,
  </div>

  <!-- Signature block -->
  <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(42,42,42,0.3);">
    <div style="font-family: Georgia, serif; font-size: 16px; color: #2a2a2a; font-weight: 500;">
      Hamza Qureshi
    </div>
    <div style="font-family: Georgia, serif; font-size: 14px; color: #2a2a2a; margin-top: 4px;">
      Senior Cybersecurity Consultant
    </div>
    <div style="font-family: Georgia, serif; font-size: 13px; color: #2a2a2a; margin-top: 6px;">
      AWS SAA-C03 | AZ-104 | Security+
    </div>
    <div style="font-family: Georgia, serif; font-size: 13px; color: #2a2a2a; margin-top: 12px;">
      Email: <a href="mailto:contact@hamzaqureshi.dev" style="color: #5a4f6e; text-decoration: none;">contact@hamzaqureshi.dev</a>
    </div>
    <div style="font-family: Georgia, serif; font-size: 13px; color: #2a2a2a; margin-top: 4px;">
      Phone: +1 (240) 869-0210
    </div>
  </div>

  <!-- Automated email disclaimer footer -->
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed rgba(42,42,42,0.3); font-family: Georgia, serif; font-size: 11px; color: rgba(42,42,42,0.6); line-height: 1.6; font-style: italic;">
    This email was sent automatically when you submitted a message on hamzaqureshi.dev. Replies to this email will be forwarded to my direct inbox at contact@hamzaqureshi.dev.
  </div>

</div>
  `.trim()
}

// ─────────────────────────────────────────────────────────────
// Admin notification email — same pastel gradient / Georgia
// / no-inner-card design as the user thank-you, but with the
// message metadata (From / Email / Phone / Company / Message)
// instead of the CTA row. No signature block since the admin
// IS Hamza — he doesn't need to be signed off to himself.
// ─────────────────────────────────────────────────────────────
function buildAdminNotificationEmail(data: {
  fullName: string
  email: string
  phone: string
  company: string
  message: string
}): string {
  return `
<div style="font-family: Georgia, serif; max-width: 720px; margin: 0 auto; padding: 48px 32px; background: #ddd2cf; background: linear-gradient(135deg, #e8e6f0 0%, #ddd2cf 50%, #c9b4b0 100%); color: #2a2a2a; line-height: 1.7;">

  <!-- Headline -->
  <div style="font-size: 22px; margin-bottom: 8px; color: #2a2a2a; font-weight: 500;">
    A new message has arrived.
  </div>
  <div style="font-size: 13px; margin-bottom: 28px; color: rgba(42,42,42,0.65); font-style: italic;">
    Submitted via the Send a Message form on hamzaqureshi.dev.
  </div>

  <!-- Metadata table -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 24px 0 8px 0; border-collapse: collapse;">
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: rgba(42,42,42,0.7); width: 110px;">From:</td>
      <td style="padding: 6px 0; font-size: 15px; color: #2a2a2a; font-weight: 500;">${escape(data.fullName)}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: rgba(42,42,42,0.7);">Email:</td>
      <td style="padding: 6px 0; font-size: 15px;"><a href="mailto:${escape(data.email)}" style="color: #5a4f6e; text-decoration: underline;">${escape(data.email)}</a></td>
    </tr>
    ${data.phone ? `<tr>
      <td style="padding: 6px 0; font-size: 14px; color: rgba(42,42,42,0.7);">Phone:</td>
      <td style="padding: 6px 0; font-size: 15px; color: #2a2a2a;">${escape(data.phone)}</td>
    </tr>` : ''}
    ${data.company ? `<tr>
      <td style="padding: 6px 0; font-size: 14px; color: rgba(42,42,42,0.7);">Company:</td>
      <td style="padding: 6px 0; font-size: 15px; color: #2a2a2a;">${escape(data.company)}</td>
    </tr>` : ''}
  </table>

  <!-- Message body label -->
  <div style="font-size: 14px; color: rgba(42,42,42,0.7); margin: 28px 0 8px 0;">
    Message:
  </div>

  <!-- Message body in a quoted block -->
  <div style="padding: 16px 20px; background: rgba(255,255,255,0.45); border-left: 3px solid #2a2a2a; font-family: Georgia, serif; font-size: 15px; color: #2a2a2a; line-height: 1.7; white-space: pre-wrap;">
${escape(data.message)}
  </div>

  <!-- Reply note -->
  <div style="font-size: 14px; line-height: 1.7; color: #2a2a2a; margin-top: 28px; font-style: italic;">
    Reply directly to this email to respond — the reply-to header is set to the sender's address.
  </div>

  <!-- Automated email disclaimer footer -->
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed rgba(42,42,42,0.3); font-family: Georgia, serif; font-size: 11px; color: rgba(42,42,42,0.6); line-height: 1.6; font-style: italic;">
    Automated notification from hamzaqureshi.dev · Direct Message form.
  </div>

</div>
  `.trim()
}
