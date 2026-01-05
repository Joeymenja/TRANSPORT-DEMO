-- Update Vehicles Table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS condition_status VARCHAR(50) DEFAULT 'GOOD';
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS next_maintenance_date DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create Vehicle Maintenance Table
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10, 2),
    service_date DATE NOT NULL,
    performed_by VARCHAR(255),
    mileage_at_service INTEGER,
    next_service_mileage INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_vehicle ON vehicle_maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_org ON vehicle_maintenance(organization_id);

-- Trigger for updated_at
CREATE TRIGGER update_vehicle_maintenance_updated_at BEFORE UPDATE ON vehicle_maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
