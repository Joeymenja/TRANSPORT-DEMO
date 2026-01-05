-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    license_number VARCHAR(50),
    license_state VARCHAR(50),
    license_expiry_date DATE,
    employment_status VARCHAR(20) CHECK (employment_status IN ('FULL_TIME', 'PART_TIME', 'CONTRACTOR')),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    assigned_vehicle_id UUID REFERENCES vehicles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_driver_user UNIQUE (user_id)
);

-- Add indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_assigned_vehicle_id ON drivers(assigned_vehicle_id);
