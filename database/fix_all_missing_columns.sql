-- Add potentially missing columns to trip_stops
ALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS odometer_reading INTEGER;
ALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS gps_latitude DECIMAL(10,8);
ALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS gps_longitude DECIMAL(11,8);
ALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS actual_arrival_time TIMESTAMP;
ALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS actual_departure_time TIMESTAMP;
ALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP;

-- Add potentially missing columns to trip_members
ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS member_signature_base64 TEXT;
ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS pickup_stop_id UUID;
ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS dropoff_stop_id UUID;
ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS ready_for_pickup_at TIMESTAMP;
ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMP;

-- Add potentially missing columns to trips
ALTER TABLE trips ADD COLUMN IF NOT EXISTS assigned_vehicle_id UUID;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMP;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS is_carpool BOOLEAN DEFAULT false;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS route_optimized BOOLEAN DEFAULT false;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS created_by_id UUID;
