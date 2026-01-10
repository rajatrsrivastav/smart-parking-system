CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'driver', 'manager', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  total_slots INTEGER NOT NULL,
  available_slots INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_name VARCHAR(255) NOT NULL,
  plate_number VARCHAR(50) NOT NULL UNIQUE,
  vehicle_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES parking_sites(id) ON DELETE CASCADE,
  parking_spot VARCHAR(50),
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_time TIMESTAMP WITH TIME ZONE,
  payment_amount DECIMAL(10, 2),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS valet_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES parking_sessions(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('park', 'retrieve')),
  status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_user_id ON parking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_site_id ON parking_sessions(site_id);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_status ON parking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_entry_time ON parking_sessions(entry_time);
CREATE INDEX IF NOT EXISTS idx_valet_assignments_driver_id ON valet_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_valet_assignments_status ON valet_assignments(status);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_available_slots(site_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE parking_sites 
  SET available_slots = available_slots - 1 
  WHERE id = site_id_param AND available_slots > 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_available_slots(site_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE parking_sites 
  SET available_slots = available_slots + 1 
  WHERE id = site_id_param;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_parking_sites_updated_at ON parking_sites;
CREATE TRIGGER update_parking_sites_updated_at
  BEFORE UPDATE ON parking_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_parking_sessions_updated_at ON parking_sessions;
CREATE TRIGGER update_parking_sessions_updated_at
  BEFORE UPDATE ON parking_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_valet_assignments_updated_at ON valet_assignments;
CREATE TRIGGER update_valet_assignments_updated_at
  BEFORE UPDATE ON valet_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO users (name, email, phone, role) VALUES
  ('John Doe', 'john.doe@example.com', '+919876543210', 'user'),
  ('Rajesh Kumar', 'rajesh.kumar@example.com', '+919876543211', 'driver'),
  ('Amit Sharma', 'amit.sharma@example.com', '+919876543212', 'manager'),
  ('Admin User', 'admin@smartparking.com', '+919876543213', 'super_admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO parking_sites (name, address, city, total_slots, available_slots) VALUES
  ('Phoenix Mall - Lower Parel', 'Lower Parel, Mumbai', 'Mumbai', 500, 455),
  ('Inorbit Mall', 'Malad West, Mumbai', 'Mumbai', 400, 380),
  ('Central Plaza', 'Andheri West, Mumbai', 'Mumbai', 300, 285),
  ('City Center Mall', 'Bandra East, Mumbai', 'Mumbai', 350, 330)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  user_john UUID;
BEGIN
  SELECT id INTO user_john FROM users WHERE email = 'john.doe@example.com' LIMIT 1;
  
  IF user_john IS NOT NULL THEN
    INSERT INTO vehicles (user_id, vehicle_name, plate_number, vehicle_type) VALUES
      (user_john, 'Toyota Camry', 'MH 12 AB 1234', 'sedan'),
      (user_john, 'Honda Civic', 'MH 14 CD 5678', 'sedan')
    ON CONFLICT (plate_number) DO NOTHING;
  END IF;
END $$;

