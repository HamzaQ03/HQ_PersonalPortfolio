import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

function pageHtml(opts: {
  status: number
  title: string
  body: string
  color: string
}): Response {
  const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${opts.title}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background: #0a0a0a;
      color: #f5e8d4;
      font-family: Georgia, serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .card {
      max-width: 520px;
      width: 100%;
      padding: 40px 32px;
      background: #1a1410;
      border: 1px solid #c8a87c;
      border-radius: 4px;
      text-align: center;
    }
    .badge {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      letter-spacing: 2px;
      color: ${opts.color};
      text-transform: uppercase;
      margin-bottom: 18px;
    }
    .title {
      font-size: 26px;
      font-style: italic;
      color: #f5e8d4;
      margin-bottom: 16px;
    }
    .body {
      font-size: 15px;
      line-height: 1.7;
      color: #ead7b8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">HQ Portfolio · Resume Access</div>
    <div class="title">${opts.title}</div>
    <div class="body">${opts.body}</div>
  </div>
</body>
</html>
  `.trim()

  return new Response(html, {
    status: opts.status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function generateToken(): string {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = ''
  const randomValues = new Uint8Array(32)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < 32; i++) {
    token += chars[randomValues[i] % chars.length]
  }
  return token
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const secret = url.searchParams.get('secret')

  if (secret !== process.env.APPROVAL_SECRET) {
    return pageHtml({
      status: 401,
      title: '401 — Unauthorized',
      body: 'This link is invalid or has expired.',
      color: '#ff6464',
    })
  }

  if (!id) {
    return pageHtml({
      status: 400,
      title: '400 — Missing ID',
      body: 'The request ID is missing from the URL.',
      color: '#ff6464',
    })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: request, error: fetchError } = await supabase
    .from('resume_access_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !request) {
    if (fetchError) {
      console.error('[resume-access-approve] Supabase fetch failed:', {
        code: fetchError.code,
        message: fetchError.message,
        id,
      })
    }
    return pageHtml({
      status: 404,
      title: '404 — Request Not Found',
      body: 'This request no longer exists.',
      color: '#ff6464',
    })
  }

  if (request.status === 'approved') {
    return pageHtml({
      status: 200,
      title: 'Already Approved',
      body: 'This request was already approved. The applicant has been notified.',
      color: '#c8a87c',
    })
  }

  if (request.status === 'rejected') {
    return pageHtml({
      status: 400,
      title: 'Already Rejected',
      body: 'This request has already been rejected.',
      color: '#ff6464',
    })
  }

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { error: updateError } = await supabase
    .from('resume_access_requests')
    .update({
      status: 'approved',
      download_token: token,
      token_expires_at: expiresAt,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    console.error('[resume-access-approve] Supabase update failed:', {
      code: updateError.code,
      message: updateError.message,
      id,
    })
    return pageHtml({
      status: 500,
      title: '500 — Database Error',
      body: `Could not update request: ${updateError.message}`,
      color: '#ff6464',
    })
  }

  // Send applicant their 24-hour download link
  const resendKey = process.env.RESEND_API_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const downloadUrl = `${siteUrl}/api/resume-download/${token}`

  if (resendKey) {
    // Parse first name from full name.
    // "Sarah Johnson" -> "Sarah" · "Sarah" -> "Sarah" · "" -> "there"
    const firstName =
      (request.full_name || '').trim().split(/\s+/)[0] || 'there'

    const applicantHtml = buildApplicantApprovalEmail({
      firstName,
      downloadUrl,
    })

    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_SENDER || 'Hamza Qureshi <onboarding@resend.dev>',
          to: [request.work_email],
          reply_to: 'contact@hamzaqureshi.dev',
          subject: 'Resume Access Inquiry',
          html: applicantHtml,
        }),
      })
      if (!resendRes.ok) {
        const errText = await resendRes.text().catch(() => '<unreadable>')
        console.error('[resume-access-approve] Resend non-OK response:', {
          status: resendRes.status,
          text: errText,
        })
      }
    } catch (err) {
      console.error('[resume-access-approve] Email failed:', err)
    }
  }

  return pageHtml({
    status: 200,
    title: '✅ Approved',
    body: `Resume access approved for ${request.full_name} at ${request.company}. They have been emailed a 24-hour download link.`,
    color: '#c8a87c',
  })
}

function buildApplicantApprovalEmail(data: {
  firstName: string
  downloadUrl: string
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
  <div style="font-size: 18px; margin-bottom: 24px; color: #2a2a2a;">
    Hi ${escape(data.firstName)},
  </div>

  <!-- Opening paragraph -->
  <div style="font-size: 15px; line-height: 1.7; color: #2a2a2a; margin-bottom: 28px;">
    Thank you for reaching out. As requested, attached below is your secure 24-hour link to download my resume, along with a few additional resources for a complete view of my background and the quality of work I deliver.
  </div>

  <!-- 4-button horizontal layout — table layout for max email-client
       compatibility (Gmail / Outlook / Apple Mail all honor it). -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 32px 0; border-collapse: separate; border-spacing: 4px 0;">
    <tr>
      <td style="width: 25%;">
        <a href="${data.downloadUrl}" style="display: block; background: #2a2a2a; color: #ffffff; padding: 12px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 13px; text-decoration: none; font-weight: 500;">
          Resume
        </a>
      </td>
      <td style="width: 25%;">
        <a href="https://hamzaqureshi.dev" style="display: block; background: rgba(255,255,255,0.6); color: #2a2a2a; border: 1px solid #2a2a2a; padding: 11px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 13px; text-decoration: none;">
          Portfolio
        </a>
      </td>
      <td style="width: 25%;">
        <a href="https://linkedin.com/in/hamza-qureshi-cybersec-professional" style="display: block; background: rgba(255,255,255,0.6); color: #2a2a2a; border: 1px solid #2a2a2a; padding: 11px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 13px; text-decoration: none;">
          LinkedIn
        </a>
      </td>
      <td style="width: 25%;">
        <a href="https://calendly.com/hamza-qureshi/30min" style="display: block; background: rgba(255,255,255,0.6); color: #2a2a2a; border: 1px solid #2a2a2a; padding: 11px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 13px; text-decoration: none;">
          Book a Meeting
        </a>
      </td>
    </tr>
  </table>

  <!-- Resource framing paragraph (updated wording) -->
  <div style="font-size: 15px; line-height: 1.7; color: #2a2a2a; margin: 32px 0 20px 0;">
    The resume tells you what I&#39;ve done, the portfolio shows how I think, LinkedIn keeps the receipts, and the booking page is where we figure out if there&#39;s something you and I can build together.
  </div>

  <!-- Standards paragraph -->
  <div style="font-size: 15px; line-height: 1.7; color: #2a2a2a; margin: 20px 0 32px 0;">
    The bar I hold myself to is simple: be the professional who makes the room better, not just busier. The work in the links above is a track record of doing exactly that. If your team values individuals who deliver more than they advertise, the conversation is worth having.
  </div>

  <!-- Sign-off -->
  <div style="font-size: 15px; line-height: 1.7; color: #2a2a2a; margin-top: 28px;">
    Looking forward to hearing from you soon.
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
    This email was sent automatically upon approval of your resume access request. Replies to this email will be forwarded to my direct inbox at contact@hamzaqureshi.dev.
  </div>

</div>
  `.trim()
}
