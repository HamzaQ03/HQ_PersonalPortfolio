import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id     = searchParams.get('id')
  const secret = searchParams.get('secret')

  if (!secret || secret !== process.env.APPROVAL_SECRET) {
    return new Response(
      `<!DOCTYPE html><html><body style="font-family:monospace;background:#0a0a0a;color:#f44;padding:40px;text-align:center">
        <h1>401 — Unauthorized</h1><p>Invalid or missing approval secret.</p>
       </body></html>`,
      { status: 401, headers: { 'Content-Type': 'text/html' } }
    )
  }

  if (!id) {
    return new Response(
      `<!DOCTYPE html><html><body style="font-family:monospace;background:#0a0a0a;color:#f44;padding:40px;text-align:center">
        <h1>400 — Missing ID</h1><p>No review ID provided.</p>
       </body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase
    .from('reviews')
    .update({ approved: true })
    .eq('id', id)

  if (error) {
    return new Response(
      `<!DOCTYPE html><html><body style="font-family:monospace;background:#0a0a0a;color:#f44;padding:40px;text-align:center">
        <h1>500 — Database Error</h1><p>${error.message}</p>
       </body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    )
  }

  return new Response(
    `<!DOCTYPE html><html><body style="font-family:monospace;background:#0a0a0a;color:#c8a87c;padding:60px;text-align:center">
      <h1 style="font-size:48px;margin-bottom:16px">✅</h1>
      <h2>Review Approved</h2>
      <p style="color:#666677">The review is now live on your portfolio.</p>
      <p style="color:#333340;font-size:12px;margin-top:40px">Review ID: ${id}</p>
     </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  )
}
