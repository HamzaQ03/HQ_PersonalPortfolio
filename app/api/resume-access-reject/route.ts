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
    .select('full_name, status')
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

  return pageHtml({
    status: 200,
    title: '🗑 Rejected',
    body: `The request from ${request.full_name} has been rejected. No email will be sent.`,
    color: '#c8a87c',
  })
}
