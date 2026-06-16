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
  reviewer_email?: string | null
  recommendation_letter_url?: string | null
  profile_picture_url?: string | null
}
