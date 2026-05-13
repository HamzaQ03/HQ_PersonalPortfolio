-- ============================================================
-- INSTRUCTIONS: Run this entire file in your Supabase dashboard
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor
-- Paste this file and click "Run"
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id          UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT                     NOT NULL,
  profession  TEXT                     NOT NULL,
  company     TEXT                     NOT NULL,
  connection  TEXT                     NOT NULL,
  rating      INTEGER                  NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT                     NOT NULL,
  approved    BOOLEAN                  DEFAULT FALSE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a review (insert)
CREATE POLICY "Anyone can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Anyone can read approved reviews only
CREATE POLICY "Anyone can read approved reviews"
  ON reviews FOR SELECT
  USING (approved = true);

-- Allow server-side approval (UPDATE) — security enforced by APPROVAL_SECRET in API route
CREATE POLICY "Allow server approval updates"
  ON reviews FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow server-side rejection (DELETE) — security enforced by APPROVAL_SECRET in API route
CREATE POLICY "Allow server rejection deletes"
  ON reviews FOR DELETE
  USING (true);
