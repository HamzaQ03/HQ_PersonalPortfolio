import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { fullName, email, company, jobTitle, reason } = data

    const resend = new Resend(process.env.RESEND_API_KEY!)

    const html = `
      <div style="font-family: Arial, sans-serif;
                  max-width: 600px; margin: 0 auto;
                  background: #0a0a0a; color: #f0f0f0;
                  padding: 32px; border-radius: 12px;">
        <h2 style="color: #c8a87c; letter-spacing: 2px;">
          📄 NEW RESUME ACCESS REQUEST
        </h2>
        <p style="color: #999;">Someone has requested access
          to your resume. Their details:</p>

        <div style="margin: 24px 0; padding: 20px;
                    background: #111; border-radius: 8px;">
          <p><strong style="color: #c8a87c;">Full Name:</strong>
             ${fullName}</p>
          <p><strong style="color: #c8a87c;">Email:</strong>
             ${email}</p>
          <p><strong style="color: #c8a87c;">Company:</strong>
             ${company || 'Not provided'}</p>
          <p><strong style="color: #c8a87c;">Job Title:</strong>
             ${jobTitle || 'Not provided'}</p>
          <p><strong style="color: #c8a87c;">Reason:</strong>
             ${reason}</p>
        </div>

        <p style="color: #999; font-size: 13px;">
          The user has been granted PREVIEW access only.
          To allow them to DOWNLOAD the full resume, reply
          to their email directly with the resume attached
          or grant approval via your dashboard.
        </p>

        <p style="color: #666; font-size: 11px; margin-top: 32px;">
          Sent from Hamza Qureshi Portfolio · Resume Access System
        </p>
      </div>
    `

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'moehamzza@gmail.com',
      subject: `📄 Resume Access Request — ${fullName}${company ? ` (${company})` : ''}`,
      html,
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error }, { status: 500 })
  }
}
