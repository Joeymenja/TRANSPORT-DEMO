-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'HOME', -- 'HOME', 'MEDICAL', 'OFFICE'
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed GVBH Locations
INSERT INTO locations (name, address, type, organization_id) VALUES
('Latona House', '6338 W Latona Road, Laveen, AZ 85339', 'HOME', 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00'),
('Carter House', '3255 W Carter Road, Phoenix, AZ 85041', 'HOME', 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00'),
('Carmen House', '1550 W Carmen Street, Phoenix, AZ 85041', 'HOME', 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00'),
('Walatowa House', '5420 W Walatowa Street, Laveen, AZ 85339', 'HOME', 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00'),
('Clover', '5610 W Hardtack Trl, Laveen, AZ 85339', 'HOME', 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00'),
('StarLight', '3921 S 97th Ave, Tolleson, AZ 85353', 'HOME', 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00'),
('Paseo', '5533 W Paseo Way, Laveen, AZ 85339', 'HOME', 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00')
ON CONFLICT DO NOTHING;
