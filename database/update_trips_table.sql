-- Add new columns for Trip Management
ALTER TABLE trips ADD COLUMN IF NOT EXISTS reason_for_visit TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS escort_name VARCHAR(255);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS escort_relationship VARCHAR(255);

-- Add new columns for Reports System
ALTER TABLE trips ADD COLUMN IF NOT EXISTS report_status VARCHAR(50) DEFAULT 'PENDING'; -- 'PENDING', 'VERIFIED', 'REJECTED', 'ARCHIVED'
ALTER TABLE trips ADD COLUMN IF NOT EXISTS report_file_path TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS report_rejection_reason TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS report_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS report_verified_by UUID;

-- COMMENT ON COLUMN trips.report_status IS 'Status of the trip report: PENDING, VERIFIED, REJECTED, ARCHIVED';
