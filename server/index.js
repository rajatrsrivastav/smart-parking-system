import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import supabase from './config/supabase.js';
import userRoutes from './routes/userRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import friendlyErrorMessage from './utils/friendlyError.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api', driverRoutes);
app.use('/api', dashboardRoutes);

app.get('/', (req, res) => {
  res.json({message: 'Smart Parking System API - Production Ready'});
});

app.get('/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('parking_sites').select('count');
    
    if (error) throw error;
    
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: friendlyErrorMessage(error)
    });
  }
});


app.get('/api/sites', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('parking_sites')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});
app.get('/api/users/:userId/vehicles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', req.params.userId);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.post('/api/parking-request', async (req, res) => {
  try {
    const { user_id, vehicle_id, site_id } = req.body;
    
    const { data: session, error: sessionError } = await supabase
      .from('parking_sessions')
      .insert([{
        user_id,
        vehicle_id,
        site_id,
        entry_time: new Date().toISOString(),
        status: 'pending',
        payment_status: 'pending'
      }])
      .select(`
        *,
        users(name, phone),
        vehicles(vehicle_name, plate_number),
        parking_sites(name, address)
      `)
      .single();

    if (sessionError) throw sessionError;

    const { data: assignment, error: assignmentError } = await supabase
      .from('valet_assignments')
      .insert([{
        session_id: session.id,
        assignment_type: 'park',
        status: 'pending',
        assigned_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (assignmentError) throw assignmentError;

    res.status(201).json({ success: true, data: { session, assignment } });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});


app.get('/api/my-session/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('parking_sessions')
      .select(`
        *,
        vehicles(vehicle_name, plate_number),
        parking_sites(name, address),
        valet_assignments(status, assignment_type)
      `)
      .eq('user_id', req.params.userId)
      .eq('status', 'active')
      .order('entry_time', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; 
    res.json({ success: true, data: data || null });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});


app.post('/api/request-retrieval', async (req, res) => {
  try {
    const { session_id, user_id } = req.body;
    
    const { data: session, error: sessionError } = await supabase
      .from('parking_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user_id)
      .single();

    if (sessionError) throw sessionError;
    if (!session) throw new Error('Session not found');
    if (session.payment_status !== 'paid') throw new Error('Payment required before retrieval');

    const { data: assignment, error: assignmentError } = await supabase
      .from('valet_assignments')
      .insert([{
        session_id,
        assignment_type: 'retrieve',
        status: 'pending',
        assigned_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (assignmentError) throw assignmentError;

    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(400).json({ success: false, error: friendlyErrorMessage(error) });
  }
});


app.post('/api/mock-payment', async (req, res) => {
  try {
    const { session_id, amount } = req.body;

    const { data, error } = await supabase
      .from('parking_sessions')
      .update({ 
        payment_status: 'paid',
        payment_amount: amount,
        payment_method: 'test'
      })
      .eq('id', session_id)
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('parking_payments')
      .insert([{
        session_id,
        user_id: data.user_id,
        amount,
        payment_method: 'test',
        payment_status: 'completed',
        transaction_id: `TEST-${Date.now()}`,
        paid_at: new Date().toISOString()
      }]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});


app.get('/api/driver/requests', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('valet_assignments')
      .select(`
        *,
        parking_sessions(
          *,
          users(name, phone),
          vehicles(vehicle_name, plate_number),
          parking_sites(name, address)
        )
      `)
      .eq('status', 'pending')
      .order('assigned_at', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});


app.post('/api/driver/accept/:requestId', async (req, res) => {
  try {
    const { driver_id } = req.body;
    
    const { data, error } = await supabase
      .from('valet_assignments')
      .update({ 
        status: 'accepted',
        driver_id
      })
      .eq('id', req.params.requestId)
      .select(`
        *,
        parking_sessions(
          *,
          users(name),
          vehicles(vehicle_name, plate_number),
          parking_sites(name, address)
        )
      `)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.post('/api/driver/complete-parking', async (req, res) => {
  try {
    const { assignment_id, parking_spot } = req.body;

    const { data: assignment } = await supabase
      .from('valet_assignments')
      .select('session_id')
      .eq('id', assignment_id)
      .single();

    const { error: sessionError } = await supabase
      .from('parking_sessions')
      .update({ 
        status: 'active',
        parking_spot
      })
      .eq('id', assignment.session_id);

    if (sessionError) throw sessionError;

    const { data, error } = await supabase
      .from('valet_assignments')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', assignment_id)
      .select()
      .single();

    if (error) throw error;

    const { data: session } = await supabase
      .from('parking_sessions')
      .select('site_id')
      .eq('id', assignment.session_id)
      .single();

    await supabase.rpc('decrement_parking_slots', { site_id: session.site_id });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.post('/api/driver/complete-retrieval', async (req, res) => {
  try {
    const { assignment_id } = req.body;

    const { data: assignment } = await supabase
      .from('valet_assignments')
      .select('session_id')
      .eq('id', assignment_id)
      .single();

    const { error: sessionError } = await supabase
      .from('parking_sessions')
      .update({ 
        status: 'completed',
        exit_time: new Date().toISOString()
      })
      .eq('id', assignment.session_id);

    if (sessionError) throw sessionError;

    const { data, error } = await supabase
      .from('valet_assignments')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', assignment_id)
      .select()
      .single();

    if (error) throw error;

    const { data: session } = await supabase
      .from('parking_sessions')
      .select('site_id')
      .eq('id', assignment.session_id)
      .single();

    await supabase.rpc('increment_parking_slots', { site_id: session.site_id });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.get('/api/my-history/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('parking_sessions')
      .select(`
        *,
        vehicles(vehicle_name, plate_number),
        parking_sites(name, address)
      `)
      .eq('user_id', req.params.userId)
      .eq('status', 'completed')
      .order('exit_time', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.get('/api/manager/dashboard', async (req, res) => {
  try {
    const { count: activeCars } = await supabase
      .from('parking_sessions')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    const { count: retrieving } = await supabase
      .from('valet_assignments')
      .select('id', { count: 'exact' })
      .eq('assignment_type', 'retrieve')
      .in('status', ['pending', 'accepted']);

    const today = new Date().toISOString().split('T')[0];
    const { data: todaySessions } = await supabase
      .from('parking_sessions')
      .select('payment_amount')
      .gte('entry_time', `${today}T00:00:00`)
      .eq('payment_status', 'paid');

    const totalToday = todaySessions?.length || 0;
    const revenue = todaySessions?.reduce((sum, s) => sum + (s.payment_amount || 0), 0) || 0;

    const { data: assignments } = await supabase
      .from('parking_sessions')
      .select(`
        *,
        vehicles(vehicle_name, plate_number),
        users(name, phone),
        parking_sites(name, address),
        valet_assignments(status, assignment_type, driver_id)
      `)
      .eq('status', 'active')
      .order('entry_time', { ascending: false });

    res.json({
      success: true,
      data: {
        activeCars: activeCars || 0,
        retrieving: retrieving || 0,
        totalToday,
        revenue,
        assignments: assignments || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.get('/api/super-admin/dashboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: todaySessions } = await supabase
      .from('parking_sessions')
      .select('payment_amount')
      .gte('entry_time', `${today}T00:00:00`);

    const ticketsIssued = todaySessions?.length || 0;
    const collection = todaySessions
      ?.filter(s => s.payment_amount)
      .reduce((sum, s) => sum + s.payment_amount, 0) || 0;

    const { count: totalVehicles } = await supabase
      .from('vehicles')
      .select('id', { count: 'exact' });

    const { count: totalDrivers } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('role', 'driver');

    const { data: allSessions } = await supabase
      .from('parking_sessions')
      .select('payment_amount')
      .eq('payment_status', 'paid');

    const totalRevenue = allSessions?.reduce((sum, s) => sum + (s.payment_amount || 0), 0) || 0;

    const { data: sites } = await supabase
      .from('parking_sites')
      .select('*');

    res.json({
      success: true,
      data: {
        todayPerformance: {
          ticketsIssued,
          collection
        },
        statistics: {
          totalVehicles: totalVehicles || 0,
          totalDrivers: totalDrivers || 0,
          totalRevenue,
          totalSites: sites?.length || 0
        },
        sites: sites || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});


app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});