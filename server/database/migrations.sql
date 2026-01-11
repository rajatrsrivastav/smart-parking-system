ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE;

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS parking_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES parking_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'card',
  payment_status VARCHAR(20) DEFAULT 'pending',
  transaction_id VARCHAR(100) UNIQUE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_qr_code ON vehicles(qr_code);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_valet_status ON valet_assignments(status);
CREATE INDEX IF NOT EXISTS idx_valet_type ON valet_assignments(assignment_type);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON parking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON parking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON parking_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON parking_payments(transaction_id);

ALTER TABLE parking_sites ADD COLUMN IF NOT EXISTS fixed_parking_fee DECIMAL(10, 2) DEFAULT 50.00;

UPDATE parking_sites SET fixed_parking_fee = 50.00 WHERE fixed_parking_fee IS NULL;

ALTER TABLE parking_sessions ADD COLUMN IF NOT EXISTS parking_fee DECIMAL(10, 2);

CREATE OR REPLACE FUNCTION decrement_parking_slots(site_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE parking_sites
  SET available_slots = GREATEST(available_slots - 1, 0)
  WHERE id = site_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_parking_slots(site_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE parking_sites
  SET available_slots = LEAST(available_slots + 1, total_slots)
  WHERE id = site_id;
END;
$$ LANGUAGE plpgsql;


INSERT INTO users (name, email, phone, role)
VALUES 
  ('Rajat Srivastav', 'rajat@example.com', '9876543210', 'user'),
  ('Priya Sharma', 'priya@example.com', '9876543211', 'user'),
  ('Amit Kumar', 'amit@example.com', '9876543212', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, phone, role, is_available)
VALUES 
  ('Rajesh Kumar', 'rajesh@driver.com', '9876543220', 'driver', true),
  ('Suresh Patel', 'suresh@driver.com', '9876543221', 'driver', true),
  ('Mahesh Singh', 'mahesh@driver.com', '9876543222', 'driver', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO parking_sites (name, address, city, total_slots, available_slots, fixed_parking_fee)
VALUES 
  ('Inorbit Mall', 'Hitech City Road', 'Hyderabad', 500, 500, 50.00),
  ('Phoenix Mall', 'Jubilee Hills', 'Hyderabad', 300, 300, 60.00),
  ('Forum Mall', 'Koramangala', 'Bangalore', 400, 400, 55.00)
ON CONFLICT DO NOTHING;

ALTER TABLE parking_sessions DROP CONSTRAINT IF EXISTS parking_sessions_status_check;
ALTER TABLE parking_sessions ADD CONSTRAINT parking_sessions_status_check 
  CHECK (status IN ('active', 'completed', 'cancelled', 'retrieval_requested'));

ALTER TABLE valet_assignments DROP CONSTRAINT IF EXISTS valet_assignments_status_check;
ALTER TABLE valet_assignments ADD CONSTRAINT valet_assignments_status_check 
  CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled'));

ALTER TABLE valet_assignments ALTER COLUMN driver_id DROP NOT NULL;

COMMENT ON TABLE parking_payments IS 'Real payment transactions - NO MOCK DATA';
COMMENT ON TABLE valet_assignments IS 'Real driver assignments from user requests';
COMMENT ON COLUMN vehicles.qr_code IS 'Unique QR code for each vehicle (UUID-based)';
COMMENT ON COLUMN users.is_available IS 'Driver availability status';

SELECT 'Database setup completed!' as status;
