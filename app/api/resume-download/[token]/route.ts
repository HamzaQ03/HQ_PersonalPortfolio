import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import path from 'path'

// Node.js runtime is required: the PDF lives in /app/api/resume-access/
// (outside /public/) and we read it from disk on every download. Edge
// has no filesystem access. Vercel supports both runtimes.
export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  context: { params: { token: string } }
) {
  const { token } = context.params

  if (!token || token.length < 16) {
    return NextResponse.redirect(new URL('/resume-expired', req.url))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: request, error: fetchError } = await supabase
    .from('resume_access_requests')
    .select('*')
    .eq('download_token', token)
    .eq('status', 'approved')
    .single()

  if (fetchError || !request) {
    return NextResponse.redirect(new URL('/resume-expired', req.url))
  }

  const now = new Date()
  const expiresAt = new Date(request.token_expires_at)
  if (now > expiresAt) {
    return NextResponse.redirect(new URL('/resume-expired', req.url))
  }

  try {
    const filePath = path.join(
      process.cwd(),
      'app',
      'api',
      'resume-access',
      'HamzaQureshi_Resume.pdf'
    )
    const fileBuffer = await readFile(filePath)

    // Track download (best-effort, don't block on failure). Log any
    // error so a silent regression on the tracking column gets caught.
    supabase
      .from('resume_access_requests')
      .update({ downloaded_at: now.toISOString() })
      .eq('id', request.id)
      .then(({ error }) => {
        if (error) {
          console.error('[resume-download] Download-tracking update failed:', {
            code: error.code,
            message: error.message,
            id: request.id,
          })
        }
      })

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="HamzaQureshi_Resume.pdf"',
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
      },
    })
  } catch (err) {
    console.error('[resume-download] Could not read file:', err)
    return NextResponse.redirect(new URL('/resume-expired', req.url))
  }
}
