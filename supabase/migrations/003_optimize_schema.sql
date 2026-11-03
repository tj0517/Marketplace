-- Odtworzone 2026-11-03 (LK-1.02) z supabase_migrations.schema_migrations na prod, treść bez zmian.
-- ==========================================
-- 1. Full-Text Search (FTS) Setup
-- ==========================================

-- Change 'fts' column type to TSVECTOR and populate it
ALTER TABLE ads 
ALTER COLUMN fts TYPE tsvector 
USING to_tsvector('polish', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(subject, ''));

-- Create/Update FTS trigger function
CREATE OR REPLACE FUNCTION ads_fts_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('polish', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' || 
    COALESCE(NEW.subject, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first to be safe)
DROP TRIGGER IF EXISTS ads_fts_trigger ON ads;

CREATE TRIGGER ads_fts_trigger
BEFORE INSERT OR UPDATE OF title, description, subject ON ads
FOR EACH ROW EXECUTE FUNCTION ads_fts_update();

-- Create GIN index for fast search
CREATE INDEX IF NOT EXISTS idx_ads_fts ON ads USING GIN(fts);

-- ==========================================
-- 2. Consolidate Sort Logic (visible_at)
-- ==========================================

DO $$ 
BEGIN 
  -- Check if promoted_at exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'promoted_at') THEN
    -- If exists, use it
     UPDATE ads 
     SET visible_at = COALESCE(promoted_at, created_at)
     WHERE visible_at IS NULL;
  ELSE
    -- If not, just use created_at
     UPDATE ads 
     SET visible_at = created_at
     WHERE visible_at IS NULL;
  END IF;
END $$;

-- Ensure visible_at is automatically set on insert
CREATE OR REPLACE FUNCTION set_visible_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.visible_at IS NULL THEN
    NEW.visible_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ads_set_visible_at ON ads;

CREATE TRIGGER ads_set_visible_at
BEFORE INSERT ON ads
FOR EACH ROW EXECUTE FUNCTION set_visible_at();

-- SAFE CLEANUP: Drop promoted_at column as it is redundant
ALTER TABLE ads DROP COLUMN IF EXISTS promoted_at;

-- ==========================================
-- 3. Transactions Table Extension (for P24)
-- ==========================================

-- Add only necessary columns for P24 integration
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS payment_session_id TEXT;

-- Index for fast lookup by P24 session ID (crucial for webhooks)
CREATE INDEX IF NOT EXISTS idx_transactions_session ON transactions(payment_session_id);

-- ==========================================
-- 4. General Performance Indexes
-- ==========================================

-- Fast free slot checking
CREATE INDEX IF NOT EXISTS idx_ads_phone_hash ON ads(phone_hash);

-- Fast cron job processing (finding expiring ads)
CREATE INDEX IF NOT EXISTS idx_ads_expires_at ON ads(expires_at) 
WHERE status = 'active';

-- Fast filtering by status
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);

-- Composite index for main listing (sorting by visible_at)
CREATE INDEX IF NOT EXISTS idx_ads_listing ON ads(status, type, visible_at DESC);
