export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const { error } = await supabase
      .from('visits')
      .delete()
      .lt('created_at', oneYearAgo.toISOString())

    if (error) throw error
    return Response.json({ success: true, message: 'Visits older than 1 year deleted' })
  } catch (error) {
    return Response.json({ success: false, error }, { status: 500 })
  }
}
