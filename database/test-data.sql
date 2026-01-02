-- Insert a test user for development
-- This assumes you already have an organization from schema.sql

DO $$
DECLARE
    org_id UUID;
BEGIN
    -- Get the first organization ID
    SELECT id INTO org_id FROM organizations LIMIT 1;
    
    -- Check if user already exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@gvbh.com') THEN
        -- Insert test user
        -- Password hash is bcrypt hash of "password123"
        INSERT INTO users (
            organization_id,
            email,
            password_hash,
            first_name,
            last_name,
            role,
            phone,
            is_active
        ) VALUES (
            org_id,
            'admin@gvbh.com',
            '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password123
            'Admin',
            'User',
            'ORG_ADMIN',
            '555-0100',
            true
        );
        
        RAISE NOTICE 'Test user created: admin@gvbh.com / password123';
    ELSE
        RAISE NOTICE 'Test user already exists';
    END IF;
    
    -- Insert a test driver
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'driver@gvbh.com') THEN
        INSERT INTO users (
            organization_id,
            email,
            password_hash,
            first_name,
            last_name,
            role,
            phone,
            is_active
        ) VALUES (
            org_id,
            'driver@gvbh.com',
            '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password123
            'John',
            'Driver',
            'DRIVER',
            '555-0101',
            true
        );
        
        RAISE NOTICE 'Test driver created: driver@gvbh.com / password123';
    END IF;
    
    -- Insert test vehicles
    IF NOT EXISTS (SELECT 1 FROM vehicles WHERE vehicle_number = 'VEH-001') THEN
        INSERT INTO vehicles (organization_id, vehicle_number, make, model, year, license_plate, capacity, is_active)
        VALUES 
            (org_id, 'VEH-001', 'Toyota', 'Sienna', 2023, 'ABC123', 7, true),
            (org_id, 'VEH-002', 'Honda', 'Odyssey', 2022, 'XYZ789', 7, true),
            (org_id, 'VEH-003', 'Chrysler', 'Pacifica', 2024, 'DEF456', 7, true);
        
        RAISE NOTICE 'Test vehicles created';
    END IF;
    
    -- Insert test members (clients)
    IF NOT EXISTS (SELECT 1 FROM members WHERE email = 'client1@example.com') THEN
        INSERT INTO members (organization_id, member_id, first_name, last_name, date_of_birth, email, phone, address, is_active)
        VALUES 
            (org_id, 'AHCCCS-001', 'Jane', 'Smith', '1990-01-15', 'client1@example.com', '555-1001', '123 Main St, Phoenix, AZ 85001', true),
            (org_id, 'AHCCCS-002', 'John', 'Doe', '1985-05-20', 'client2@example.com', '555-1002', '456 Oak Ave, Phoenix, AZ 85002', true),
            (org_id, 'AHCCCS-003', 'Mary', 'Johnson', '1992-08-10', 'client3@example.com', '555-1003', '789 Elm St, Phoenix, AZ 85003', true);
        
        RAISE NOTICE 'Test clients created';
    END IF;
END $$;
