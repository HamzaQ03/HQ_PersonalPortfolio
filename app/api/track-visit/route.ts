export async function POST(req: Request) {
  try {
    const { page } = await req.json()
    const forwarded = req.headers.get('x-forwarded-for')
    const ip        = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    const userAgent = req.headers.get('user-agent') || ''
    const referrer  = req.headers.get('referer')    || 'direct'

    const device = /mobile|android|iphone|ipad/i.test(userAgent) ? 'Mobile' : 'Desktop'

    let browser = 'Other'
    if      (userAgent.includes('Edg'))     browser = 'Edge'
    else if (userAgent.includes('Chrome'))  browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari'))  browser = 'Safari'

    let country = 'Unknown'
    let city    = 'Unknown'
    try {
      const geo     = await fetch(`http://ip-api.com/json/${ip}`, { signal: AbortSignal.timeout(3000) })
      const geoData = await geo.json()
      country = geoData.country || 'Unknown'
      city    = geoData.city    || 'Unknown'
    } catch { /* geo lookup failed — keep Unknown */ }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const host        = req.headers.get('host') || ''
    const cleanReferrer = referrer.includes(host) ? 'direct' : referrer

    await supabase.from('visits').insert({
      page, country, city, device, browser,
      referrer: cleanReferrer,
      ip,
    })

    // Auto cleanup every 1000 visits
    const { count } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
    if (count && count % 1000 === 0) {
      fetch('/api/cleanup-visits').catch(() => {})
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ success: false })
  }
}
