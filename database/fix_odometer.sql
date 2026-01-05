-- Add missing columns to trip_stops table
ALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS odometer_reading INTEGER;
