-- Add missing columns to trip_members table
ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS member_signature_base64 TEXT;
