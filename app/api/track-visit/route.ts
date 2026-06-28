export const runtime = 'edge'

function parseOS(ua: string): string {
  if (/Windows NT/i.test(ua)) return 'Windows'
  if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Android/i.test(ua)) return 'Android'
  if (/Linux/i.test(ua)) return 'Linux'
  if (/CrOS/i.test(ua)) return 'ChromeOS'
  return 'Other'
}

function parseBrowser(ua: string): string {
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  return 'Other'
}

function parseDevice(ua: string): string {
  return /mobile|android|iphone|ipad/i.test(ua) ? 'Mobile' : 'Desktop'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { visitor_id, browser_session_id, page, language, timezone } = body || {}

    if (!visitor_id || !browser_session_id || !page) {
      return Response.json({ success: false, error: 'missing fields' }, { status: 400 })
    }

    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    const userAgent = req.headers.get('user-agent') || ''
    const referrer = req.headers.get('referer') || 'direct'
    const host = req.headers.get('host') || ''
    const cleanReferrer = referrer.includes(host) ? 'direct' : referrer

    const os = parseOS(userAgent)
    const browser = parseBrowser(userAgent)
    const device = parseDevice(userAgent)

    // Geo lookup (best effort, free service)
    let country = 'Unknown'
    let region = 'Unknown'
    let city = 'Unknown'
    let isp = 'Unknown'
    let serverTimezone = 'Unknown'
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,timezone`, {
        signal: AbortSignal.timeout(3000),
      })
      const data = await geo.json()
      if (data?.status === 'success') {
        country = data.country || 'Unknown'
        region = data.regionName || 'Unknown'
        city = data.city || 'Unknown'
        isp = data.isp || 'Unknown'
        serverTimezone = data.timezone || 'Unknown'
      }
    } catch {}

    const locationParts = [city, region, country].filter((p) => p && p !== 'Unknown')
    const location = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown'

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if this visitor already has a recent session row
    const { data: existing, error: existingErr } = await supabase
      .from('sessions')
      .select('id, visit_number')
      .eq('visitor_id', visitor_id)
      .order('started_at', { ascending: false })
      .limit(1)

    if (existingErr) {
      console.error('[track-visit] Lookup failed:', existingErr.message)
    }

    let sessionId: string | null = null
    let visitNumber = 1

    // Reuse if last session is recent (within 30 minutes)
    const lastSession = existing?.[0]
    const reuseExisting = lastSession ? await (async () => {
      const { data: lastRow } = await supabase
        .from('sessions')
        .select('last_activity')
        .eq('id', lastSession.id)
        .single()
      if (!lastRow?.last_activity) return false
      const ageMs = Date.now() - new Date(lastRow.last_activity).getTime()
      return ageMs < 30 * 60 * 1000 // 30-min idle window
    })() : false

    if (reuseExisting && lastSession) {
      sessionId = lastSession.id
      visitNumber = lastSession.visit_number
      // Update last_activity
      await supabase
        .from('sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', sessionId)
    } else {
      // Calculate visit number: count of existing sessions for this visitor + 1
      const { count: priorCount } = await supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('visitor_id', visitor_id)
      visitNumber = (priorCount || 0) + 1

      const { data: created, error: createErr } = await supabase
        .from('sessions')
        .insert({
          visitor_id,
          visit_number: visitNumber,
          location,
          isp,
          timezone: timezone || serverTimezone,
          language: language || 'unknown',
          os,
          browser,
          device,
          ip,
          referrer: cleanReferrer,
          clicks: [],
        })
        .select('id')
        .single()

      if (createErr) {
        console.error('[track-visit] Session insert failed:', createErr.message)
        return Response.json({ success: false }, { status: 500 })
      }
      sessionId = created.id
    }

    // Insert the page view
    const { error: pvErr } = await supabase
      .from('page_views')
      .insert({
        session_id: sessionId,
        page,
      })

    if (pvErr) {
      console.error('[track-visit] Page view insert failed:', pvErr.message)
    }

    return Response.json({ success: true, session_id: sessionId, visit_number: visitNumber })
  } catch (err) {
    console.error('[track-visit] Unexpected error:', err)
    return Response.json({ success: false })
  }
}
