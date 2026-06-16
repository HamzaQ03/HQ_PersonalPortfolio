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

const escape = (s: string) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

function buildApplicantDeclineEmail(data: {
  firstName: string
}): string {
  return `
<div style="font-family: Georgia, serif; max-width: 720px; margin: 0 auto; padding: 48px 32px; background: #ddd2cf; background: linear-gradient(135deg, #e8e6f0 0%, #ddd2cf 50%, #c9b4b0 100%); color: #2a2a2a; line-height: 1.7;">

  <!-- Greeting -->
  <div style="font-size: 18px; margin-bottom: 24px;">
    Hi ${escape(data.firstName)},
  </div>

  <!-- Body paragraph -->
  <div style="font-size: 15px; margin-bottom: 28px;">
    Thank you for reaching out. Unfortunately, at this moment I was not able to accept your request to access my resume. Please reach out to <a href="mailto:contact@hamzaqureshi.dev" style="color: #5a4f6e; text-decoration: none;">contact@hamzaqureshi.dev</a> for any questions or concerns.
  </div>

  <!-- Best regards -->
  <div style="font-size: 15px; margin-top: 24px;">
    Best regards,
  </div>

  <!-- Signature block -->
  <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(42,42,42,0.3);">
    <div style="font-size: 16px; font-weight: 500;">
      Hamza Qureshi
    </div>
    <div style="font-size: 14px; margin-top: 4px;">
      Senior Cybersecurity Consultant
    </div>
    <div style="font-size: 13px; margin-top: 6px;">
      AWS SAA-C03 | AZ-104 | Security+
    </div>
    <div style="font-size: 13px; margin-top: 12px;">
      Email: <a href="mailto:contact@hamzaqureshi.dev" style="color: #5a4f6e; text-decoration: none;">contact@hamzaqureshi.dev</a>
    </div>
    <div style="font-size: 13px; margin-top: 4px;">
      Phone: +1 (240) 869-0210
    </div>
  </div>

  <!-- Automated disclaimer footer -->
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed rgba(42,42,42,0.3); font-family: Georgia, serif; font-size: 11px; color: rgba(42,42,42,0.6); line-height: 1.6; font-style: italic;">
    This email was sent automatically following your resume access request. Replies to this email will be forwarded to my direct inbox at contact@hamzaqureshi.dev.
  </div>

</div>
  `.trim()
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
    .select('full_name, work_email, status')
    .eq('id', id)
    .single()

  if (fetchError || !request) {
    return pageHtml({
      status: 404,
      title: '404 — Request Not Found',
      body: 'This request no longer exists.',
      color: '#ff6464',
    })
  }

  if (request.status === 'rejected') {
    return pageHtml({
      status: 200,
      title: 'Already Rejected',
      body: 'This request was already rejected.',
      color: '#c8a87c',
    })
  }

  // Soft reject — keep the row for audit
  const { error: updateError } = await supabase
    .from('resume_access_requests')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    return pageHtml({
      status: 500,
      title: '500 — Database Error',
      body: `Could not update: ${updateError.message}`,
      color: '#ff6464',
    })
  }

  // Send the requester a polite decline email. Best-effort: the row
  // is already updated, so a Resend hiccup must not unwind the
  // rejection state — log and continue.
  const firstName =
    (request.full_name || '').trim().split(/\s+/)[0] || 'there'

  const declineHtml = buildApplicantDeclineEmail({ firstName })

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:
          process.env.EMAIL_SENDER ||
          'Hamza Qureshi <onboarding@resend.dev>',
        to: [request.work_email],
        reply_to: 'contact@hamzaqureshi.dev',
        subject: 'Resume Access Request',
        html: declineHtml,
      }),
    })
  } catch (emailError) {
    console.error(
      '[resume-access-reject] Failed to send decline email:',
      emailError
    )
  }

  return pageHtml({
    status: 200,
    title: '🗑 Rejected',
    body: `The request from ${request.full_name} has been rejected. No email will be sent.`,
    color: '#c8a87c',
  })
}
