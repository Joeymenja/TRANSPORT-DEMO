-- GVBH Transportation Platform Database Schema
-- PostgreSQL 15+
-- Multi-tenant architecture with row-level security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ORGANIZATIONS (Multi-tenant)
-- =============================================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    ensora_api_key TEXT, -- Encrypted
    ensora_api_endpoint VARCHAR(500),
    ensora_sync_enabled BOOLEAN DEFAULT false,
    ensora_last_sync_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_subdomain ON organizations(subdomain);
CREATE INDEX idx_organizations_active ON organizations(is_active);

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ORG_ADMIN', 'DISPATCHER', 'DRIVER')),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, email)
);

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================================================
-- MEMBERS (Clients)
-- =============================================================================
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    ensora_client_id VARCHAR(100), -- For synced clients
    member_id VARCHAR(100) NOT NULL, -- AHCCCS ID
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    import_source VARCHAR(50) DEFAULT 'MANUAL' CHECK (import_source IN ('MANUAL', 'ENSORA_API', 'CSV_IMPORT')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, member_id)
);

CREATE INDEX idx_members_org ON members(organization_id);
CREATE INDEX idx_members_ensora_id ON members(ensora_client_id);
CREATE INDEX idx_members_active ON members(is_active);

-- =============================================================================
-- APPOINTMENTS
-- =============================================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    appointment_datetime TIMESTAMP NOT NULL,
    estimated_duration_minutes INTEGER DEFAULT 60,
    appointment_type VARCHAR(100),
    location_name VARCHAR(255) NOT NULL,
    location_address TEXT NOT NULL,
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    provider_name VARCHAR(255),
    purpose VARCHAR(500),
    notes TEXT,
    appointment_card_image_url TEXT, -- S3 URL
    ocr_confidence_score INTEGER CHECK (ocr_confidence_score BETWEEN 0 AND 100),
    trip_id UUID, -- References trips.id (set after trip created)
    return_trip_id UUID, -- For pickup trips
    created_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_org ON appointments(organization_id);
CREATE INDEX idx_appointments_member ON appointments(member_id);
CREATE INDEX idx_appointments_datetime ON appointments(appointment_datetime);
CREATE INDEX idx_appointments_trip ON appointments(trip_id);

-- =============================================================================
-- VEHICLES
-- =============================================================================
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    license_plate VARCHAR(20),
    vin VARCHAR(50),
    capacity INTEGER DEFAULT 4,
    odometer INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, vehicle_number)
);

CREATE INDEX idx_vehicles_org ON vehicles(organization_id);
CREATE INDEX idx_vehicles_active ON vehicles(is_active);

-- =============================================================================
-- TRIPS
-- =============================================================================
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    trip_date DATE NOT NULL,
    assigned_driver_id UUID REFERENCES users(id),
    assigned_vehicle_id UUID REFERENCES vehicles(id),
    trip_type VARCHAR(50) DEFAULT 'DROP_OFF' CHECK (trip_type IN ('DROP_OFF', 'PICK_UP', 'ROUND_TRIP')),
    is_carpool BOOLEAN DEFAULT false,
    route_optimized BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'WAITING_FOR_CLIENTS', 'COMPLETED', 'FINALIZED', 'CANCELLED')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    finalized_at TIMESTAMP,
    created_by_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trips_org ON trips(organization_id);
CREATE INDEX idx_trips_driver ON trips(assigned_driver_id);
CREATE INDEX idx_trips_vehicle ON trips(assigned_vehicle_id);
CREATE INDEX idx_trips_date ON trips(trip_date);
CREATE INDEX idx_trips_status ON trips(status);

-- =============================================================================
-- TRIP STOPS
-- =============================================================================
CREATE TABLE trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    stop_type VARCHAR(50) NOT NULL CHECK (stop_type IN ('PICKUP', 'DROPOFF')),
    stop_order INTEGER NOT NULL, -- For multi-stop carpool trips
    address TEXT NOT NULL,
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    scheduled_time TIMESTAMP,
    actual_arrival_time TIMESTAMP,
    actual_departure_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_stops_trip ON trip_stops(trip_id);
CREATE INDEX idx_trip_stops_type ON trip_stops(stop_type);

-- =============================================================================
-- TRIP MEMBERS (Many-to-many for carpool trips)
-- =============================================================================
CREATE TABLE trip_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    pickup_stop_id UUID REFERENCES trip_stops(id),
    dropoff_stop_id UUID REFERENCES trip_stops(id),
    member_status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (member_status IN ('SCHEDULED', 'PICKED_UP', 'DROPPED_OFF', 'READY_FOR_PICKUP', 'COMPLETED')),
    ready_for_pickup_at TIMESTAMP,
    notification_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_id, member_id)
);

CREATE INDEX idx_trip_members_trip ON trip_members(trip_id);
CREATE INDEX idx_trip_members_member ON trip_members(member_id);
CREATE INDEX idx_trip_members_status ON trip_members(member_status);

-- =============================================================================
-- PICKUP NOTIFICATIONS
-- =============================================================================
CREATE TABLE pickup_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_member_id UUID NOT NULL REFERENCES trip_members(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('SMS', 'PUSH', 'PORTAL')),
    sent_to VARCHAR(255) NOT NULL, -- Phone number or user ID
    message_body TEXT NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'PENDING' CHECK (delivery_status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED')),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pickup_notifications_trip_member ON pickup_notifications(trip_member_id);
CREATE INDEX idx_pickup_notifications_status ON pickup_notifications(delivery_status);

-- =============================================================================
-- SIGNATURES
-- =============================================================================
CREATE TABLE signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    trip_member_id UUID NOT NULL REFERENCES trip_members(id) ON DELETE CASCADE,
    signature_image_url TEXT NOT NULL, -- S3 URL
    signed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    device_identifier VARCHAR(255),
    signer_type VARCHAR(50) NOT NULL CHECK (signer_type IN ('MEMBER', 'ATTENDANT', 'ESCORT', 'GUARDIAN', 'PARENT', 'PROVIDER')),
    signer_name VARCHAR(255), -- If not member
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_signatures_trip_member ON signatures(trip_member_id);

-- =============================================================================
-- MEMBER TRIP REPORTS (Generated PDFs)
-- =============================================================================
CREATE TABLE member_trip_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    pdf_url TEXT NOT NULL, -- S3 URL
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_locked BOOLEAN DEFAULT true,
    override_reason TEXT,
    override_by_id UUID REFERENCES users(id),
    override_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_member_trip_reports_member ON member_trip_reports(member_id);
CREATE INDEX idx_member_trip_reports_trip ON member_trip_reports(trip_id);
CREATE INDEX idx_member_trip_reports_date ON member_trip_reports(report_date);

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id), -- Nullable for system events
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- =============================================================================
-- TRIGGERS FOR updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_stops_updated_at BEFORE UPDATE ON trip_stops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SAMPLE DATA (For development)
-- =============================================================================

-- Insert default organization
INSERT INTO organizations (name, subdomain, is_active) VALUES
('GVBH Demo Organization', 'gvbh-demo', true);
