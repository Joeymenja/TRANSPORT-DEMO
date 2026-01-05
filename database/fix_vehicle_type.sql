-- Add missing vehicle_type column
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50);
