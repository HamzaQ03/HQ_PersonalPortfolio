export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const text = await req.text()
    const { visitor_id } = JSON.parse(text || '{}')
    if (!visitor_id) return Response.json({ success: false })

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Update last_activity on the most recent session for this visitor
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('visitor_id', visitor_id)
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (session?.id) {
      await supabase
        .from('sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', session.id)
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('[track-session-end] Unexpected error:', err)
    return Response.json({ success: false })
  }
}
