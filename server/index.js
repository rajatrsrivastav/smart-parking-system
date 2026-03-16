import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/database.js';
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

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use('/api', userRoutes);
app.use('/api', driverRoutes);
app.use('/api', dashboardRoutes);

app.get('/', (req, res) => {
  res.json({message: 'Smart Parking System API - Production Ready'});
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// app.get('/health', async (req, res) => {
//   try {
//     const { data, error } = await supabase.from('parking_sites').select('count');
    
//     if (error) throw error;
    
//     res.json({ 
//       status: 'healthy', 
//       database: 'connected',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       status: 'unhealthy', 
//       database: 'disconnected',
//       error: friendlyErrorMessage(error)
//     });
//   }
// });

app.get('/api/sites', async (req, res) => {
  try {
    const data = await prisma.parkingSite.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});
app.get('/api/users/:userId/vehicles', async (req, res) => {
  try {
    const data = await prisma.vehicle.findMany({
      where: { user_id: req.params.userId }
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.post('/api/parking-request', async (req, res) => {
  try {
    const { user_id, vehicle_id, site_id } = req.body;
    
    const session = await prisma.parkingSession.create({
      data: {
        user_id,
        vehicle_id,
        site_id,
        entry_time: new Date().toISOString(),
        status: 'pending',
        payment_status: 'pending'
      },
      include: {
        user: { select: { name: true, phone: true } },
        vehicle: { select: { vehicle_name: true, plate_number: true } },
        parking_site: { select: { name: true, address: true } }
      }
    });

    const assignment = await prisma.valetAssignment.create({
      data: {
        session_id: session.id,
        assignment_type: 'park',
        status: 'pending',
        assigned_at: new Date().toISOString()
      }
    });

    // Transform to match Supabase response format
    const transformedSession = {
      ...session,
      users: session.user,
      vehicles: session.vehicle,
      parking_sites: session.parking_site
    };
    delete transformedSession.user;
    delete transformedSession.vehicle;
    delete transformedSession.parking_site;

    res.status(201).json({ success: true, data: { session: transformedSession, assignment } });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});


app.get('/api/my-session/:userId', async (req, res) => {
  try {
    const data = await prisma.parkingSession.findFirst({
      where: {
        user_id: req.params.userId,
        status: 'active'
      },
      include: {
        vehicle: { select: { vehicle_name: true, plate_number: true } },
        parking_site: { select: { name: true, address: true } },
        valet_assignments: { select: { status: true, assignment_type: true } }
      },
      orderBy: { entry_time: 'desc' }
    });

    // Transform to match Supabase response format
    const transformedData = data ? {
      ...data,
      vehicles: data.vehicle,
      parking_sites: data.parking_site
    } : null;
    
    if (transformedData) {
      delete transformedData.vehicle;
      delete transformedData.parking_site;
    }

    res.json({ success: true, data: transformedData });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.post('/api/mock-payment', async (req, res) => {
  try {
    const { session_id, amount } = req.body;

    const data = await prisma.parkingSession.update({
      where: { id: session_id },
      data: {
        payment_status: 'paid',
        payment_amount: amount,
        payment_method: 'test'
      }
    });

    await prisma.parkingPayment.create({
      data: {
        session_id,
        user_id: data.user_id,
        amount,
        payment_method: 'test',
        payment_status: 'completed',
        transaction_id: `TEST-${Date.now()}`,
        paid_at: new Date().toISOString()
      }
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});


app.get('/api/driver/requests', async (req, res) => {
  try {
    const data = await prisma.valetAssignment.findMany({
      where: { status: 'pending' },
      include: {
        parking_session: {
          include: {
            user: { select: { name: true, phone: true } },
            vehicle: { select: { vehicle_name: true, plate_number: true } },
            parking_site: { select: { name: true, address: true } }
          }
        }
      },
      orderBy: { assigned_at: 'asc' }
    });

    // Transform to match Supabase response format
    const transformedData = data.map(assignment => ({
      ...assignment,
      parking_sessions: {
        ...assignment.parking_session,
        users: assignment.parking_session.user,
        vehicles: assignment.parking_session.vehicle,
        parking_sites: assignment.parking_session.parking_site
      }
    }));

    transformedData.forEach(item => {
      delete item.parking_session;
      if (item.parking_sessions) {
        delete item.parking_sessions.user;
        delete item.parking_sessions.vehicle;
        delete item.parking_sessions.parking_site;
      }
    });

    res.json({ success: true, data: transformedData });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});


app.post('/api/driver/accept/:requestId', async (req, res) => {
  try {
    const { driver_id } = req.body;
    
    const data = await prisma.valetAssignment.update({
      where: { id: req.params.requestId },
      data: {
        status: 'accepted',
        driver_id
      },
      include: {
        parking_session: {
          include: {
            user: { select: { name: true } },
            vehicle: { select: { vehicle_name: true, plate_number: true } },
            parking_site: { select: { name: true, address: true } }
          }
        }
      }
    });

    // Transform to match Supabase response format
    const transformedData = {
      ...data,
      parking_sessions: {
        ...data.parking_session,
        users: data.parking_session.user,
        vehicles: data.parking_session.vehicle,
        parking_sites: data.parking_session.parking_site
      }
    };
    delete transformedData.parking_session;
    if (transformedData.parking_sessions) {
      delete transformedData.parking_sessions.user;
      delete transformedData.parking_sessions.vehicle;
      delete transformedData.parking_sessions.parking_site;
    }

    res.json({ success: true, data: transformedData });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.post('/api/driver/complete-parking', async (req, res) => {
  try {
    const { assignment_id, parking_spot } = req.body;

    const assignment = await prisma.valetAssignment.findUnique({
      where: { id: assignment_id },
      select: { session_id: true }
    });

    await prisma.parkingSession.update({
      where: { id: assignment.session_id },
      data: {
        status: 'active',
        parking_spot
      }
    });

    const data = await prisma.valetAssignment.update({
      where: { id: assignment_id },
      data: {
        status: 'completed',
        completed_at: new Date().toISOString()
      }
    });

    const session = await prisma.parkingSession.findUnique({
      where: { id: assignment.session_id },
      select: { site_id: true }
    });

    await prisma.parkingSite.update({
      where: { id: session.site_id },
      data: { available_slots: { decrement: 1 } }
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.post('/api/driver/complete-retrieval', async (req, res) => {
  try {
    const { assignment_id } = req.body;

    const assignment = await prisma.valetAssignment.findUnique({
      where: { id: assignment_id },
      select: { session_id: true }
    });

    await prisma.parkingSession.update({
      where: { id: assignment.session_id },
      data: {
        status: 'completed',
        exit_time: new Date().toISOString()
      }
    });

    const data = await prisma.valetAssignment.update({
      where: { id: assignment_id },
      data: {
        status: 'completed',
        completed_at: new Date().toISOString()
      }
    });

    const session = await prisma.parkingSession.findUnique({
      where: { id: assignment.session_id },
      select: { site_id: true }
    });

    await prisma.parkingSite.update({
      where: { id: session.site_id },
      data: { available_slots: { increment: 1 } }
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.get('/api/my-history/:userId', async (req, res) => {
  try {
    const data = await prisma.parkingSession.findMany({
      where: {
        user_id: req.params.userId,
        status: 'completed'
      },
      include: {
        vehicle: { select: { vehicle_name: true, plate_number: true } },
        parking_site: { select: { name: true, address: true } }
      },
      orderBy: { exit_time: 'desc' },
      take: 20
    });

    // Transform to match Supabase response format
    const transformedData = data.map(session => ({
      ...session,
      vehicles: session.vehicle,
      parking_sites: session.parking_site
    }));
    
    transformedData.forEach(item => {
      delete item.vehicle;
      delete item.parking_site;
    });

    res.json({ success: true, data: transformedData });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.get('/api/manager/dashboard', async (req, res) => {
  try {
    const activeCars = await prisma.parkingSession.count({
      where: { status: 'active' }
    });

    const retrieving = await prisma.valetAssignment.count({
      where: {
        assignment_type: 'retrieve',
        status: { in: ['pending', 'accepted'] }
      }
    });

    const today = new Date().toISOString().split('T')[0];
    const todaySessions = await prisma.parkingSession.findMany({
      where: {
        entry_time: { gte: `${today}T00:00:00` },
        payment_status: 'paid'
      },
      select: { payment_amount: true }
    });

    const totalToday = todaySessions?.length || 0;
    const revenue = todaySessions?.reduce((sum, s) => sum + (parseFloat(s.payment_amount) || 0), 0) || 0;

    const assignments = await prisma.parkingSession.findMany({
      where: { status: 'active' },
      include: {
        vehicle: { select: { vehicle_name: true, plate_number: true } },
        user: { select: { name: true, phone: true } },
        parking_site: { select: { name: true, address: true } },
        valet_assignments: { select: { status: true, assignment_type: true, driver_id: true } }
      },
      orderBy: { entry_time: 'desc' }
    });

    // Transform to match Supabase response format
    const transformedAssignments = assignments.map(session => ({
      ...session,
      vehicles: session.vehicle,
      users: session.user,
      parking_sites: session.parking_site
    }));

    transformedAssignments.forEach(item => {
      delete item.vehicle;
      delete item.user;
      delete item.parking_site;
    });

    res.json({
      success: true,
      data: {
        activeCars: activeCars || 0,
        retrieving: retrieving || 0,
        totalToday,
        revenue,
        assignments: transformedAssignments || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
});

app.get('/api/super-admin/dashboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todaySessions = await prisma.parkingSession.findMany({
      where: { entry_time: { gte: `${today}T00:00:00` } },
      select: { payment_amount: true }
    });

    const ticketsIssued = todaySessions?.length || 0;
    const collection = todaySessions
      ?.filter(s => s.payment_amount)
      .reduce((sum, s) => sum + parseFloat(s.payment_amount), 0) || 0;

    const totalVehicles = await prisma.vehicle.count();
    const totalDrivers = await prisma.user.count({
      where: { role: 'driver' }
    });

    const allSessions = await prisma.parkingSession.findMany({
      where: { payment_status: 'paid' },
      select: { payment_amount: true }
    });

    const totalRevenue = allSessions?.reduce((sum, s) => sum + (parseFloat(s.payment_amount) || 0), 0) || 0;

    const sites = await prisma.parkingSite.findMany();

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