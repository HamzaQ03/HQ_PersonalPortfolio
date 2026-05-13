-- Run this in your Supabase SQL editor
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  country TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  referrer TEXT,
  ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert visits"
  ON visits FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read visits"
  ON visits FOR SELECT USING (true);

CREATE POLICY "Allow delete old visits"
  ON visits FOR DELETE USING (true);
