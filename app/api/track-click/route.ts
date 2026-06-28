export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { visitor_id, target, page } = await req.json()
    if (!visitor_id || !target) {
      return Response.json({ success: false }, { status: 400 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Find the most recent session for this visitor
    const { data: session, error: lookupErr } = await supabase
      .from('sessions')
      .select('id, clicks')
      .eq('visitor_id', visitor_id)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (lookupErr || !session) {
      console.error('[track-click] No session found for visitor:', visitor_id)
      return Response.json({ success: false })
    }

    const existingClicks = Array.isArray(session.clicks) ? session.clicks : []
    const newClick = {
      target,
      page: page || 'unknown',
      at: new Date().toISOString(),
    }

    const { error: updateErr } = await supabase
      .from('sessions')
      .update({
        clicks: [...existingClicks, newClick],
        last_activity: new Date().toISOString(),
      })
      .eq('id', session.id)

    if (updateErr) {
      console.error('[track-click] Update failed:', updateErr.message)
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('[track-click] Unexpected error:', err)
    return Response.json({ success: false })
  }
}
