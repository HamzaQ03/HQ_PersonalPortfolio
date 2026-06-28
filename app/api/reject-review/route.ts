import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const escape = (s: string) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// Polished card-style HTML response (matches the resume-access page style).
// Declares UTF-8 in both the meta tag and the Content-Type header so emoji /
// em-dashes don't decode as Latin-1 mojibake.
function pageHtml(opts: {
  status: number
  title: string
  body: string
  color: string
  reviewId?: string
}): Response {
  const idLine = opts.reviewId
    ? `<div class="meta">Review ID: ${escape(opts.reviewId)}</div>`
    : ''
  const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escape(opts.title)}</title>
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
    .meta {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: rgba(245,232,212,0.4);
      margin-top: 28px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">HQ Portfolio · Review Moderation</div>
    <div class="title">${escape(opts.title)}</div>
    <div class="body">${opts.body}</div>
    ${idLine}
  </div>
</body>
</html>
  `.trim()

  return new Response(html, {
    status: opts.status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function buildReviewerDeclinedEmail(data: { firstName: string }): string {
  return `
<div style="font-family: Georgia, serif; max-width: 720px; margin: 0 auto; padding: 48px 32px; background: #ddd2cf; background: linear-gradient(135deg, #e8e6f0 0%, #ddd2cf 50%, #c9b4b0 100%); color: #2a2a2a; line-height: 1.7;">

  <!-- Greeting -->
  <div style="font-size: 18px; margin-bottom: 24px; color: #2a2a2a;">
    Hi ${escape(data.firstName)},
  </div>

  <!-- Body paragraph -->
  <div style="font-size: 15px; line-height: 1.7; color: #2a2a2a; margin-bottom: 28px;">
    Thank you so much for taking the time to share your thoughts with me. After review, I am unable to publish this submission to the portfolio at this time. Please reach out to <a href="mailto:contact@hamzaqureshi.dev" style="color: #5a4f6e; text-decoration: none;">contact@hamzaqureshi.dev</a> with any questions or concerns.
  </div>

  <!-- Best regards -->
  <div style="font-size: 15px; line-height: 1.7; color: #2a2a2a; margin-top: 24px;">
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

  <!-- Automated disclaimer footer -->
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed rgba(42,42,42,0.3); font-family: Georgia, serif; font-size: 11px; color: rgba(42,42,42,0.6); line-height: 1.6; font-style: italic;">
    This email was sent automatically following your review submission. Replies to this email will be forwarded to my direct inbox at contact@hamzaqureshi.dev.
  </div>

</div>
  `.trim()
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id     = searchParams.get('id')
  const secret = searchParams.get('secret')

  if (!secret || secret !== process.env.APPROVAL_SECRET) {
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
      body: 'The review ID is missing from the URL.',
      color: '#ff6464',
    })
  }

  // Moderation routes are protected by APPROVAL_SECRET and run server-side
  // only, so use the service role key to bypass RLS. With the anon key, the
  // SELECT before delete would return null (SELECT policy requires
  // approved=true) and the email lookup would always fail.
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      '[reject-review] SUPABASE_SERVICE_ROLE_KEY missing — falling back to anon key; lookup + delete will be RLS-blocked.'
    )
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { persistSession: false } }
  )

  // Fetch the row BEFORE deleting so (a) the reviewer's email is still
  // available for the decline notification and (b) we can short-circuit
  // when a second click lands on a row that was already rejected. Reject
  // is a hard delete, so a missing row IS "already rejected" — we treat
  // it as a benign idempotent retry rather than a 500.
  const { data: review, error: fetchError } = await supabase
    .from('reviews')
    .select('name, reviewer_email')
    .eq('id', id)
    .maybeSingle()

  if (fetchError) {
    console.error('[reject-review] Supabase fetch failed:', {
      code: fetchError.code,
      message: fetchError.message,
      id,
    })
    return pageHtml({
      status: 500,
      title: '500 — Database Error',
      body: `Could not look up the review: ${escape(fetchError.message)}`,
      color: '#ff6464',
    })
  }

  if (!review) {
    return pageHtml({
      status: 200,
      title: 'Already Rejected',
      body: 'This review has already been rejected and removed. The reviewer was notified at that time — no second decline email will be sent.',
      color: '#c8a87c',
      reviewId: id,
    })
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[reject-review] Supabase delete failed:', {
      code: error.code,
      message: error.message,
      id,
    })
    return pageHtml({
      status: 500,
      title: '500 — Database Error',
      body: `Could not delete the review: ${escape(error.message)}`,
      color: '#ff6464',
    })
  }

  // Send the reviewer a polite decline. Best-effort — the row is already
  // gone, so an email failure must not surface as an error to the admin.
  if (review?.reviewer_email) {
    const firstName =
      (review.name || '').trim().split(/\s+/)[0] || 'there'

    const declineHtml = buildReviewerDeclinedEmail({ firstName })

    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_SENDER || 'Hamza Qureshi <onboarding@resend.dev>',
          to: [review.reviewer_email],
          reply_to: 'contact@hamzaqureshi.dev',
          subject: 'Update on your review submission',
          html: declineHtml,
        }),
      })
      if (!resendRes.ok) {
        const errText = await resendRes.text().catch(() => '<unreadable>')
        console.error('[reject-review] Resend non-OK response:', {
          status: resendRes.status,
          text: errText,
        })
      }
    } catch (emailError) {
      console.error('[reject-review] Failed to send decline email:', emailError)
    }
  }

  return pageHtml({
    status: 200,
    title: 'Review Rejected',
    body: 'The review has been removed and will not appear on your portfolio. The reviewer has been notified.',
    color: '#c8a87c',
    reviewId: id,
  })
}
