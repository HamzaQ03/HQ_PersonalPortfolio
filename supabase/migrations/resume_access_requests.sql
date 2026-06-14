-- ============================================================
-- INSTRUCTIONS: Run this entire file in your Supabase dashboard
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor
-- Paste this file and click "Run"
-- ============================================================

CREATE TABLE IF NOT EXISTS resume_access_requests (
  id               UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name        TEXT                     NOT NULL,
  work_email       TEXT                     NOT NULL,
  company          TEXT                     NOT NULL,
  phone            TEXT,
  reason           TEXT,
  status           TEXT                     NOT NULL DEFAULT 'pending'
                                            CHECK (status IN ('pending', 'approved', 'rejected')),
  download_token   TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  approved_at      TIMESTAMP WITH TIME ZONE,
  rejected_at      TIMESTAMP WITH TIME ZONE,
  downloaded_at    TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE resume_access_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a resume access request (insert)
CREATE POLICY "Anyone can insert requests"
  ON resume_access_requests FOR INSERT
  WITH CHECK (true);

-- Allow the approve / reject / download routes to look up rows by id or token
CREATE POLICY "Allow server reads"
  ON resume_access_requests FOR SELECT
  USING (true);

-- Allow server-side approve / reject / download-tracking updates —
-- security enforced by APPROVAL_SECRET in the API routes
CREATE POLICY "Allow server status updates"
  ON resume_access_requests FOR UPDATE
  USING (true)
  WITH CHECK (true);
