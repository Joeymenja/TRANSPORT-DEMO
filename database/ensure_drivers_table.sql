CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    license_number VARCHAR NOT NULL,
    license_state VARCHAR,
    employment_status VARCHAR DEFAULT 'CONTRACTOR',
    current_status VARCHAR,
    current_latitude DECIMAL,
    current_longitude DECIMAL,
    last_status_update TIMESTAMP,
    assigned_vehicle_id UUID,
    emergency_contact_name VARCHAR,
    emergency_contact_phone VARCHAR,
    license_expiry_date DATE,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
