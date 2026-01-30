-- Migration: Add promoted_at column to ads table
-- Run this SQL in Supabase SQL Editor

-- Add promoted_at column for ad promotion feature
ALTER TABLE ads
ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for faster sorting by promoted_at
CREATE INDEX IF NOT EXISTS idx_ads_promoted_at ON ads (promoted_at DESC NULLS LAST);

-- Comment explaining the column
COMMENT ON COLUMN ads.promoted_at IS 'Timestamp when ad was last promoted/bumped to top of listings';
