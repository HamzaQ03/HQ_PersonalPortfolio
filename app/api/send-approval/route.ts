import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const {
      id,
      name,
      email,
      profession,
      company,
      connection,
      rating,
      reviewText,
      letterUrl,
    }: {
      id: string
      name: string
      email?: string
      profession: string
      company: string
      connection: string
      rating: number
      reviewText: string
      letterUrl?: string | null
    } = await request.json()

    const resendKey = process.env.RESEND_API_KEY
    const adminEmail = process.env.APPROVAL_EMAIL || 'moehamzza@gmail.com'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const secret = process.env.APPROVAL_SECRET

    const approveUrl = `${siteUrl}/api/approve-review?id=${id}&secret=${secret}`
    const rejectUrl  = `${siteUrl}/api/reject-review?id=${id}&secret=${secret}`

    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)

    const html = buildAdminEmailHtml({
      name,
      email: email || '',
      profession,
      company,
      connection,
      stars,
      reviewText,
      approveUrl,
      rejectUrl,
      letterUrl: letterUrl || null,
    })

    if (resendKey) {
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
            reply_to: email || undefined,
            subject: `New Review Pending Approval — ${name}`,
            html,
          }),
        })
      } catch (err) {
        console.error('[send-approval] Admin email failed:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[send-approval]', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

function buildAdminEmailHtml(data: {
  name: string
  email: string
  profession: string
  company: string
  connection: string
  stars: string
  reviewText: string
  approveUrl: string
  rejectUrl: string
  letterUrl: string | null
}): string {
  const escape = (s: string) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const letterButtonRow = data.letterUrl
    ? `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 16px 0; border-collapse: separate;">
    <tr>
      <td>
        <a href="${data.letterUrl}" target="_blank" style="display: block; background: transparent; color: #2a2a2a; border: 1px solid #2a2a2a; padding: 13px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 14px; text-decoration: none;">
          ↓ Download Recommendation Letter
        </a>
      </td>
    </tr>
  </table>`
    : ''

  return `
<div style="font-family: Georgia, serif; max-width: 720px; margin: 0 auto; padding: 48px 32px; background: #ddd2cf; background: linear-gradient(135deg, #e8e6f0 0%, #ddd2cf 50%, #c9b4b0 100%); color: #2a2a2a; line-height: 1.7;">

  <!-- Greeting -->
  <div style="font-size: 18px; margin-bottom: 24px;">
    Hi Hamza,
  </div>

  <!-- Opening paragraph -->
  <div style="font-size: 15px; margin-bottom: 28px;">
    A new review has just been submitted on your portfolio. Here are the details for your approval.
  </div>

  <!-- Review details card -->
  <div style="background: rgba(255,255,255,0.5); border: 1px solid rgba(42,42,42,0.2); border-radius: 4px; padding: 20px 24px; margin: 24px 0;">
    <div style="font-size: 14px; margin-bottom: 12px;">
      <strong>Reviewer:</strong> ${escape(data.name)}
    </div>
    <div style="font-size: 14px; margin-bottom: 12px;">
      <strong>Reviewer Email:</strong> ${escape(data.email)}
    </div>
    <div style="font-size: 14px; margin-bottom: 12px;">
      <strong>Profession:</strong> ${escape(data.profession)}
    </div>
    <div style="font-size: 14px; margin-bottom: 12px;">
      <strong>Company:</strong> ${escape(data.company)}
    </div>
    <div style="font-size: 14px; margin-bottom: 12px;">
      <strong>Relationship:</strong> ${escape(data.connection)}
    </div>
    <div style="font-size: 14px; margin-bottom: 12px;">
      <strong>Rating:</strong> <span style="color: #8a6d3b; font-size: 18px; letter-spacing: 2px;">${data.stars}</span>
    </div>
    <div style="font-size: 15px; line-height: 1.7; font-style: italic; border-left: 2px solid #2a2a2a; padding-left: 16px; margin-top: 16px;">
      &ldquo;${escape(data.reviewText)}&rdquo;
    </div>
  </div>

  <!-- Approve / Decline button row -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 32px 0; border-collapse: separate; border-spacing: 4px 0;">
    <tr>
      <td style="width: 50%;">
        <a href="${data.approveUrl}" style="display: block; background: #2a2a2a; color: #ffffff; padding: 14px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 14px; text-decoration: none; font-weight: 500;">
          Approve Review
        </a>
      </td>
      <td style="width: 50%;">
        <a href="${data.rejectUrl}" style="display: block; background: rgba(255,255,255,0.6); color: #2a2a2a; border: 1px solid #2a2a2a; padding: 13px 8px; border-radius: 2px; text-align: center; font-family: Georgia, serif; font-size: 14px; text-decoration: none;">
          Reject Review
        </a>
      </td>
    </tr>
  </table>
${letterButtonRow}
  <!-- Instructional text -->
  <div style="font-size: 14px; margin: 32px 0 20px 0;">
    Approving will publish the review on your portfolio and send the reviewer a thank-you email. Rejecting will remove the submission and send the reviewer a polite decline message.
  </div>

  <!-- Automated disclaimer footer -->
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed rgba(42,42,42,0.3); font-family: Georgia, serif; font-size: 11px; color: rgba(42,42,42,0.6); line-height: 1.6; font-style: italic;">
    This email was sent automatically when a new review was submitted via hamzaqureshi.dev/reviews.
  </div>

</div>
  `.trim()
}
