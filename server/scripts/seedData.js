import supabase from '../config/supabase.js';

async function seedData() {
  try {
    console.log('🌱 Starting data seed...\n');

    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'demo@example.com')
      .limit(1);

    let userId;
    if (!users || users.length === 0) {
      const { data: newUser } = await supabase
        .from('users')
        .insert([
          {
            name: 'Demo User',
            email: 'demo@example.com',
            phone: '9876543210',
            role: 'user'
          }
        ])
        .select()
        .single();
      userId = newUser.id;
      console.log(' Created demo user:', userId);
    } else {
      userId = users[0].id;
      console.log(' Using existing demo user:', userId);
    }

    const { data: sites } = await supabase
      .from('parking_sites')
      .select('id')
      .limit(1);

    if (!sites || sites.length === 0) {
      console.log('❌ No parking sites found. Please create at least one parking site first.');
      return;
    }

    const siteId = sites[0].id;
    console.log(' Using parking site:', siteId);

    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    let vehicleId;
    if (!vehicles || vehicles.length === 0) {
      const { data: newVehicle } = await supabase
        .from('vehicles')
        .insert([
          {
            user_id: userId,
            vehicle_name: 'Honda City',
            plate_number: 'MH 02 AB 1234',
            vehicle_type: 'sedan'
          }
        ])
        .select()
        .single();
      vehicleId = newVehicle.id;
      console.log('  Created demo vehicle:', vehicleId);
    } else {
      vehicleId = vehicles[0].id;
      console.log('  Using existing demo vehicle:', vehicleId);
    }

    const now = new Date();

    const { data: activeSessions } = await supabase
      .from('parking_sessions')
      .select('id')
      .eq('status', 'active')
      .limit(1);

    if (!activeSessions || activeSessions.length === 0) {
      await supabase.from('parking_sessions').insert([
        {
          user_id: userId,
          vehicle_id: vehicleId,
          site_id: siteId,
          parking_spot: 'A-24',
          entry_time: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          payment_status: 'pending',
          payment_amount: null
        }
      ]);
      console.log('  Created active parking session');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionsToCreate = [];
    for (let i = 1; i <= 3; i++) {
      const entryTime = new Date(today);
      entryTime.setHours(9 + i, i * 10, 0);

      const exitTime = new Date(entryTime);
      exitTime.setHours(exitTime.getHours() + 1);

      sessionsToCreate.push({
        user_id: userId,
        vehicle_id: vehicleId,
        site_id: siteId,
        parking_spot: `A-${20 + i}`,
        entry_time: entryTime.toISOString(),
        exit_time: exitTime.toISOString(),
        status: 'completed',
        payment_status: 'paid',
        payment_amount: 150 + (i * 50)
      });
    }

    const { data: newCompletedSessions, error: completedError } = await supabase
      .from('parking_sessions')
      .insert(sessionsToCreate)
      .select();

    if (completedError) {
      console.error('❌ Error creating completed sessions:', completedError);
    } else {
      console.log('  Created 3 completed parking sessions (today)');
    }

    const { data: drivers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'driver')
      .limit(2);

    if (drivers && drivers.length > 0) {
      const { data: parkedAssignments } = await supabase
        .from('valet_assignments')
        .select('id')
        .eq('status', 'completed')
        .eq('assignment_type', 'parking')
        .limit(1);

      if (!parkedAssignments || parkedAssignments.length === 0) {
        const activeSession = activeSessions?.[0]?.id;
        if (activeSession) {
          await supabase.from('valet_assignments').insert([
            {
              parking_session_id: activeSession,
              driver_id: drivers[0].id,
              assignment_type: 'parking',
              status: 'completed',
              assigned_at: new Date(now - 120 * 60 * 1000).toISOString(),
              completed_at: new Date(now - 100 * 60 * 1000).toISOString()
            }
          ]);
          console.log('  Created parked valet assignment');
        }
      }

      const { data: retrievingAssignments } = await supabase
        .from('valet_assignments')
        .select('id')
        .eq('status', 'accepted')
        .eq('assignment_type', 'retrieve')
        .limit(1);

      if (!retrievingAssignments || retrievingAssignments.length === 0) {
        const activeSession = activeSessions?.[0]?.id;
        if (activeSession) {
          await supabase.from('valet_assignments').insert([
            {
              parking_session_id: activeSession,
              driver_id: drivers[0].id,
              assignment_type: 'retrieve',
              status: 'accepted',
              assigned_at: new Date(now - 30 * 60 * 1000).toISOString()
            }
          ]);
          console.log('  Created retrieving valet assignment');
        }
      }

      const { data: retrievedAssignments } = await supabase
        .from('valet_assignments')
        .select('id')
        .eq('status', 'completed')
        .eq('assignment_type', 'retrieve')
        .limit(1);

      if (!retrievedAssignments || retrievedAssignments.length === 0) {
        if (newCompletedSessions && newCompletedSessions.length > 0) {
          await supabase.from('valet_assignments').insert([
            {
              parking_session_id: newCompletedSessions[0].id,
              driver_id: drivers[1]?.id || drivers[0].id,
              assignment_type: 'retrieve',
              status: 'completed',
              assigned_at: new Date(now - 1440 * 60 * 1000).toISOString(),
              completed_at: new Date(now - 1420 * 60 * 1000).toISOString()
            }
          ]);
          console.log('  Created retrieved valet assignment');
        }
      }
    }

    console.log('\n  Data seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedData();
