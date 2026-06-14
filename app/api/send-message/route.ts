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

    // STEP 2 — send notification email via Resend HTTP API.
    // Best-effort: if this fails the message is still persisted in
    // Supabase, so the UI still reports success.
    let emailSent = false
    let emailError: string | null = null

    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      try {
        const emailHtml = buildEmailHtml({
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
            subject: `New portfolio message from ${trimmedFullName}`,
            html: emailHtml,
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
// Email HTML — editorial styling to match the portfolio aesthetic
// (cream parchment, Courier monospace labels, taupe accent rule).
// ─────────────────────────────────────────────────────────────
function buildEmailHtml(data: {
  fullName: string
  email: string
  phone: string
  company: string
  message: string
}): string {
  const escape = (s: string) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 30px; background: #faf8f3; color: #1a1410;">
      <div style="border-bottom: 1px solid #c8a87c; padding-bottom: 16px; margin-bottom: 24px;">
        <div style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 2px; color: #c8a87c; text-transform: uppercase;">
          HQ Portfolio · Direct Message
        </div>
        <div style="font-size: 22px; margin-top: 8px; font-style: italic;">
          New message received
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #8a7960; letter-spacing: 1.5px; text-transform: uppercase;">From</div>
        <div style="font-size: 16px; margin-top: 4px;">${escape(data.fullName)}</div>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #8a7960; letter-spacing: 1.5px; text-transform: uppercase;">Email</div>
        <div style="font-size: 16px; margin-top: 4px;">
          <a href="mailto:${escape(data.email)}" style="color: #1a1410;">${escape(data.email)}</a>
        </div>
      </div>

      ${
        data.phone
          ? `<div style="margin-bottom: 20px;">
              <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #8a7960; letter-spacing: 1.5px; text-transform: uppercase;">Phone</div>
              <div style="font-size: 16px; margin-top: 4px;">${escape(data.phone)}</div>
            </div>`
          : ''
      }

      ${
        data.company
          ? `<div style="margin-bottom: 20px;">
              <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #8a7960; letter-spacing: 1.5px; text-transform: uppercase;">Company</div>
              <div style="font-size: 16px; margin-top: 4px;">${escape(data.company)}</div>
            </div>`
          : ''
      }

      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #c8a87c;">
        <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #8a7960; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">Message</div>
        <div style="font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${escape(data.message)}</div>
      </div>

      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed #c8a87c; font-family: 'Courier New', monospace; font-size: 10px; color: #8a7960; letter-spacing: 1.5px; text-transform: uppercase;">
        Reply directly to this email — the reply-to is set to the sender.
      </div>
    </div>
  `.trim()
}
