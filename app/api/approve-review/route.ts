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
// Important: declares UTF-8 in BOTH the meta tag and the Content-Type header
// so emoji / em-dash / curly quotes don't get mojibake'd into garbage like
// "âœ…" when the browser falls back to Latin-1.
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

function buildReviewerApprovedEmail(data: { firstName: string }): string {
  return `
<div style="font-family: Georgia, serif; max-width: 720px; margin: 0 auto; padding: 48px 32px; background: #ddd2cf; background: linear-gradient(135deg, #e8e6f0 0%, #ddd2cf 50%, #c9b4b0 100%); color: #2a2a2a; line-height: 1.7;">

  <!-- Greeting -->
  <div style="font-size: 18px; margin-bottom: 24px; color: #2a2a2a;">
    Hi ${escape(data.firstName)},
  </div>

  <!-- Opening paragraph -->
  <div style="font-size: 15px; line-height: 1.7; color: #2a2a2a; margin-bottom: 28px;">
    Thank you so much for taking the time to share your experience. Your review has been published on my portfolio and means more than you know. It is feedback like yours that shapes how I show up to every project, every conversation, and every team going forward.
  </div>

  <!-- Single CTA — view the published review -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 32px 0; border-collapse: separate;">
    <tr>
      <td>
        <a href="https://hamzaqureshi.dev/reviews" style="display: block; background: #2a2a2a; color: #ffffff; padding: 14px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 14px; text-decoration: none; font-weight: 500;">
          View Your Review
        </a>
      </td>
    </tr>
  </table>

  <!-- Best regards -->
  <div style="font-size: 15px; line-height: 1.7; color: #2a2a2a; margin-top: 32px;">
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
    This email was sent automatically when your review was approved and published. Replies to this email will be forwarded to my direct inbox at contact@hamzaqureshi.dev.
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
  // UPDATE would be silently no-op (no anon UPDATE policy) and the email
  // lookup SELECT would return null (SELECT policy requires approved=true).
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      '[approve-review] SUPABASE_SERVICE_ROLE_KEY missing — falling back to anon key; UPDATE will be RLS-blocked.'
    )
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { persistSession: false } }
  )

  // Idempotency guard — read current state BEFORE flipping the bit so a
  // second click on the approve link doesn't trigger a duplicate UPDATE and
  // (more importantly) a duplicate thank-you email to the reviewer.
  const { data: existing, error: fetchError } = await supabase
    .from('reviews')
    .select('name, reviewer_email, approved')
    .eq('id', id)
    .maybeSingle()

  if (fetchError) {
    return pageHtml({
      status: 500,
      title: '500 — Database Error',
      body: `Could not look up the review: ${escape(fetchError.message)}`,
      color: '#ff6464',
    })
  }

  if (!existing) {
    return pageHtml({
      status: 404,
      title: 'Review Not Found',
      body: 'This review no longer exists. It may have been rejected and removed.',
      color: '#c8a87c',
      reviewId: id,
    })
  }

  if (existing.approved === true) {
    return pageHtml({
      status: 200,
      title: 'Already Approved',
      body: 'This review was already approved. The reviewer has been notified — no second email will be sent.',
      color: '#c8a87c',
      reviewId: id,
    })
  }

  const { error } = await supabase
    .from('reviews')
    .update({ approved: true })
    .eq('id', id)

  if (error) {
    return pageHtml({
      status: 500,
      title: '500 — Database Error',
      body: `Could not approve the review: ${escape(error.message)}`,
      color: '#ff6464',
    })
  }

  // Use the row we already fetched — no need for a second SELECT.
  const review = existing

  if (review?.reviewer_email) {
    const firstName =
      (review.name || '').trim().split(/\s+/)[0] || 'there'

    const thankYouHtml = buildReviewerApprovedEmail({ firstName })

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_SENDER || 'Hamza Qureshi <onboarding@resend.dev>',
          to: [review.reviewer_email],
          reply_to: 'contact@hamzaqureshi.dev',
          subject: 'Your review has been published',
          html: thankYouHtml,
        }),
      })
    } catch (emailError) {
      console.error('[approve-review] Failed to send thank-you email:', emailError)
    }
  }

  return pageHtml({
    status: 200,
    title: 'Review Approved',
    body: 'The review is now live on your portfolio. The reviewer has been emailed a thank-you confirmation.',
    color: '#c8a87c',
    reviewId: id,
  })
}
