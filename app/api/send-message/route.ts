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
// Admin notification email — pastel gradient design matching the
// other transactional emails on the portfolio (resume access,
// review approval/decline).
// ─────────────────────────────────────────────────────────────
function buildAdminNotificationEmail(data: {
  fullName: string
  email: string
  phone: string
  company: string
  message: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Message — hamzaqureshi.dev</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #e8e6f0 0%, #ddd2cf 50%, #c9b4b0 100%); font-family: Georgia, 'Times New Roman', serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background: #f5f1ea; border: 1px solid #c8a87c; border-radius: 4px; box-shadow: 0 8px 28px rgba(0,0,0,0.15);">
          <tr>
            <td style="padding: 36px 40px 28px;">
              <p style="margin: 0 0 6px; font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 2px; color: #8b7a55; text-transform: uppercase;">
                Portfolio · Direct Message
              </p>
              <h1 style="margin: 0 0 24px; font-family: Georgia, serif; font-size: 22px; font-weight: 400; color: #1a1410; letter-spacing: 0.5px;">
                A new message has arrived.
              </h1>
              <hr style="border: none; border-top: 1px solid rgba(200,168,124,0.4); margin: 0 0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 24px;">
                <tr><td style="padding: 6px 0; font-family: Georgia, serif; font-size: 14px; color: #4a3f2a; width: 110px;">From:</td><td style="padding: 6px 0; font-family: Georgia, serif; font-size: 14px; color: #1a1410;"><strong>${escape(data.fullName)}</strong></td></tr>
                <tr><td style="padding: 6px 0; font-family: Georgia, serif; font-size: 14px; color: #4a3f2a;">Email:</td><td style="padding: 6px 0; font-family: Georgia, serif; font-size: 14px;"><a href="mailto:${escape(data.email)}" style="color: #1a1410; text-decoration: underline;">${escape(data.email)}</a></td></tr>
                ${data.phone ? `<tr><td style="padding: 6px 0; font-family: Georgia, serif; font-size: 14px; color: #4a3f2a;">Phone:</td><td style="padding: 6px 0; font-family: Georgia, serif; font-size: 14px; color: #1a1410;">${escape(data.phone)}</td></tr>` : ''}
                ${data.company ? `<tr><td style="padding: 6px 0; font-family: Georgia, serif; font-size: 14px; color: #4a3f2a;">Company:</td><td style="padding: 6px 0; font-family: Georgia, serif; font-size: 14px; color: #1a1410;">${escape(data.company)}</td></tr>` : ''}
              </table>
              <p style="margin: 0 0 8px; font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 1.5px; color: #8b7a55; text-transform: uppercase;">
                Message
              </p>
              <div style="padding: 16px 20px; background: #ede5d6; border-left: 3px solid #c8a87c; font-family: Georgia, serif; font-size: 14px; color: #1a1410; line-height: 1.7; white-space: pre-wrap;">
${escape(data.message)}
              </div>
              <p style="margin: 24px 0 0; font-family: Georgia, serif; font-style: italic; font-size: 12px; color: #6b5a3a;">
                Reply directly to this email to respond — the reply-to header is set to the sender's address.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 18px 40px; background: rgba(200,168,124,0.15); border-top: 1px solid rgba(200,168,124,0.3); border-radius: 0 0 4px 4px;">
              <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 1.5px; color: #6b5a3a; text-align: center; text-transform: uppercase;">
                Automated · hamzaqureshi.dev · Direct Message
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// ─────────────────────────────────────────────────────────────
// User-facing thank-you email — same pastel gradient template,
// 3 outlined CTA buttons (Portfolio, Schedule Meeting, LinkedIn)
// and the standard signature block.
// ─────────────────────────────────────────────────────────────
function buildUserThankYouEmail(firstName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Thank you for your message</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #e8e6f0 0%, #ddd2cf 50%, #c9b4b0 100%); font-family: Georgia, 'Times New Roman', serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background: #f5f1ea; border: 1px solid #c8a87c; border-radius: 4px; box-shadow: 0 8px 28px rgba(0,0,0,0.15);">
          <tr>
            <td style="padding: 40px 40px 28px;">
              <p style="margin: 0 0 6px; font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 2px; color: #8b7a55; text-transform: uppercase;">
                Hamza Qureshi · Portfolio
              </p>
              <h1 style="margin: 0 0 24px; font-family: Georgia, serif; font-size: 24px; font-weight: 400; color: #1a1410; letter-spacing: 0.5px;">
                Thanks for your message.
              </h1>
              <p style="margin: 0 0 18px; font-family: Georgia, serif; font-size: 15px; line-height: 1.7; color: #2a2418;">
                Hi ${escape(firstName)},
              </p>
              <p style="margin: 0 0 18px; font-family: Georgia, serif; font-size: 15px; line-height: 1.7; color: #2a2418;">
                Your message has safely landed in my inbox, thank you for taking the time to reach out. I read every message personally and will get back to you within 48 hours, or maybe even sooner.
              </p>
              <p style="margin: 0 0 24px; font-family: Georgia, serif; font-size: 15px; line-height: 1.7; color: #2a2418;">
                In the meantime, feel free to explore the rest of the portfolio, schedule a meeting directly on my calendar, or connect with me on LinkedIn using the resources below. If anything else comes to mind, please feel free to reply to this email and it will route directly to me.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 8px 0 28px;">
                <tr>
                  <td style="padding: 4px 0;">
                    <a href="https://hamzaqureshi.dev" target="_blank" style="display: block; background: transparent; color: #2a2a2a; border: 1px solid #2a2a2a; padding: 13px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 14px; text-decoration: none;">
                      ↗ Explore the Portfolio
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;">
                    <a href="https://calendly.com/hamza-qureshi/30min" target="_blank" style="display: block; background: transparent; color: #2a2a2a; border: 1px solid #2a2a2a; padding: 13px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 14px; text-decoration: none;">
                      ↗ Schedule a Meeting
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;">
                    <a href="https://linkedin.com/in/hamza-qureshi-cybersec-professional" target="_blank" style="display: block; background: transparent; color: #2a2a2a; border: 1px solid #2a2a2a; padding: 13px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 14px; text-decoration: none;">
                      ↗ Connect on LinkedIn
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 6px; font-family: Georgia, serif; font-size: 15px; line-height: 1.7; color: #2a2418;">
                Looking forward to our conversation.
              </p>
              <p style="margin: 18px 0 4px; font-family: Georgia, serif; font-size: 15px; color: #2a2418;">
                Best regards,
              </p>
              <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 16px; font-weight: 700; color: #1a1410;">
                Hamza Qureshi
              </p>
              <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 13px; color: #4a3f2a;">
                Senior Cybersecurity Consultant
              </p>
              <p style="margin: 0 0 4px; font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.5px; color: #6b5a3a;">
                AWS SAA-C03 | AZ-104 | Security+
              </p>
              <p style="margin: 8px 0 4px; font-family: Georgia, serif; font-size: 13px; color: #4a3f2a;">
                <a href="mailto:contact@hamzaqureshi.dev" style="color: #4a3f2a; text-decoration: none;">contact@hamzaqureshi.dev</a> · 240-869-0210
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 18px 40px; background: rgba(200,168,124,0.15); border-top: 1px solid rgba(200,168,124,0.3); border-radius: 0 0 4px 4px;">
              <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 1.5px; color: #6b5a3a; text-align: center; text-transform: uppercase;">
                Automated · Sent from hamzaqureshi.dev · Reply to reach Hamza directly
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
