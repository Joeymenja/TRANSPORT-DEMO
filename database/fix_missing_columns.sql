-- Add missing columns to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS mobility_requirement VARCHAR(50) DEFAULT 'AMBULATORY';
ALTER TABLE members ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS insurance_id VARCHAR(100);
ALTER TABLE members ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50);
ALTER TABLE members ADD COLUMN IF NOT EXISTS special_notes TEXT;
