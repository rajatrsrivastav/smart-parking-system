DECLARE
  demo_user_id UUID := 'd7eb7b17-6d46-4df7-8b43-c50206863e28';
  demo_site_id UUID;
  demo_vehicle_id UUID;
  completed_session_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = demo_user_id) THEN
    RAISE EXCEPTION 'User with ID % not found', demo_user_id;
  END IF;

  SELECT id INTO demo_site_id FROM parking_sites LIMIT 1;

  IF demo_site_id IS NULL THEN
    RAISE EXCEPTION 'No parking site found';
  END IF;

  SELECT id INTO demo_vehicle_id FROM vehicles WHERE user_id = demo_user_id LIMIT 1;

  IF demo_vehicle_id IS NULL THEN
    RAISE EXCEPTION 'No vehicle found for user %', demo_user_id;
  END IF;

  -- Only create completed parking sessions for demo user (no ongoing sessions)
  INSERT INTO parking_sessions (
    user_id, vehicle_id, site_id, parking_spot,
    entry_time, exit_time, status, payment_status, payment_amount
  )
  VALUES
    (demo_user_id, demo_vehicle_id, demo_site_id, 'A-21',
     NOW()::DATE + INTERVAL '9 hours 10 minutes',
     NOW()::DATE + INTERVAL '10 hours 10 minutes',
     'completed', 'completed', 200),
    (demo_user_id, demo_vehicle_id, demo_site_id, 'A-22',
     NOW()::DATE + INTERVAL '11 hours 20 minutes',
     NOW()::DATE + INTERVAL '12 hours 20 minutes',
     'completed', 'completed', 250),
    (demo_user_id, demo_vehicle_id, demo_site_id, 'A-23',
     NOW()::DATE + INTERVAL '13 hours 30 minutes',
     NOW()::DATE + INTERVAL '14 hours 30 minutes',
     'completed', 'completed', 300);

  SELECT id INTO completed_session_id
  FROM parking_sessions
  WHERE user_id = demo_user_id
    AND status = 'completed'
    AND DATE(entry_time) = CURRENT_DATE
  ORDER BY entry_time ASC
  LIMIT 1;

  -- Note: No valet assignments created since all sessions are completed

  RAISE NOTICE 'Demo data seeded successfully!';
  RAISE NOTICE 'Using existing User ID: %', demo_user_id;
  RAISE NOTICE 'Using existing Vehicle ID: %', demo_vehicle_id;
  RAISE NOTICE 'Demo Site ID: %', demo_site_id;
  RAISE NOTICE 'Completed Session ID: %', completed_session_id;

END $$;
