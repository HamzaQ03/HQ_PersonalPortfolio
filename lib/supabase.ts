import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Review = {
  id: string
  name: string
  profession: string
  company: string
  connection: string
  rating: number
  review_text: string
  approved: boolean
  created_at: string
}
