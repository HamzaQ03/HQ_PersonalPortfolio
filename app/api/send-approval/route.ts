import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const {
      id,
      name,
      profession,
      company,
      connection,
      rating,
      reviewText,
    }: {
      id: string
      name: string
      profession: string
      company: string
      connection: string
      rating: number
      reviewText: string
    } = await request.json()

    const secret   = process.env.APPROVAL_SECRET
    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    const approveUrl = `${siteUrl}/api/approve-review?id=${id}&secret=${secret}`
    const rejectUrl  = `${siteUrl}/api/reject-review?id=${id}&secret=${secret}`

    const stars   = '★'.repeat(rating) + '☆'.repeat(5 - rating)

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #f0f0f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
    .header { border-bottom: 1px solid #1c1c1c; padding-bottom: 24px; margin-bottom: 32px; }
    .header h1 { font-size: 20px; color: #c8a87c; margin: 0 0 6px; letter-spacing: 0.05em; }
    .header p  { font-size: 13px; color: #666677; margin: 0; font-family: monospace; }
    .card { background: #111111; border: 1px solid #1c1c1c; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .field { margin-bottom: 16px; }
    .field-label { font-size: 10px; color: #666677; letter-spacing: 0.15em; text-transform: uppercase; font-family: monospace; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #f0f0f0; }
    .stars { font-size: 22px; color: #c8a87c; letter-spacing: 2px; }
    .review-text { font-size: 15px; color: #9aa8c0; line-height: 1.7; font-style: italic; border-left: 2px solid #c8a87c; padding-left: 16px; margin-top: 20px; }
    .actions { display: flex; gap: 16px; margin-top: 32px; }
    .btn { display: inline-block; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; text-align: center; letter-spacing: 0.05em; font-family: monospace; }
    .btn-approve { background: #c8a87c; color: #000000; }
    .btn-reject  { background: transparent; color: #666677; border: 1px solid #333340; }
    .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #1c1c1c; font-size: 12px; color: #333340; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Review Pending Approval</h1>
      <p>// Hamza Qureshi Portfolio · Review System</p>
    </div>

    <div class="card">
      <div class="field">
        <div class="field-label">Reviewer</div>
        <div class="field-value">${name}</div>
      </div>
      <div class="field">
        <div class="field-label">Profession</div>
        <div class="field-value">${profession}</div>
      </div>
      <div class="field">
        <div class="field-label">Company</div>
        <div class="field-value">${company}</div>
      </div>
      <div class="field">
        <div class="field-label">Relationship</div>
        <div class="field-value">${connection}</div>
      </div>
      <div class="field">
        <div class="field-label">Rating</div>
        <div class="stars">${stars}</div>
      </div>
      <div class="review-text">&ldquo;${reviewText}&rdquo;</div>
    </div>

    <div class="actions">
      <a href="${approveUrl}" class="btn btn-approve">✅ APPROVE REVIEW</a>
      <a href="${rejectUrl}"  class="btn btn-reject">🗑 REJECT &amp; DELETE</a>
    </div>

    <div class="footer">
      Review ID: ${id}
    </div>
  </div>
</body>
</html>`

    await resend.emails.send({
      from:    'onboarding@resend.dev',
      to:      'moehamzza@gmail.com',
      subject: 'New Review Pending Approval — Hamza Qureshi Portfolio',
      html,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[send-approval]', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
