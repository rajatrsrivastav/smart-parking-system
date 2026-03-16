import prisma from '../config/database.js';

const friendlyErrorMessage = (err) => {
  if (!err) return 'Something went wrong. Please try again.';
  
  // Handle Prisma errors
  if (err.code === 'P2002') {
    return 'A vehicle with that plate number already exists.';
  }
  if (err.code === 'P2025') {
    return 'Requested item not found.';
  }
  if (err.code === 'P2003') {
    return 'Related record not found.';
  }
  
  const msg = (err.message || String(err)).toLowerCase();
  if (/payment required/.test(msg)) return 'Payment is required before retrieval.';
  if (/not found/.test(msg)) return 'Requested item not found.';

  return 'Something went wrong. Please try again.';
};

export const getSites = async (req, res) => {
  try {
    const data = await prisma.parkingSite.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const getUserVehicles = async (req, res) => {
  try {
    const data = await prisma.vehicle.findMany({
      where: { user_id: req.params.userId }
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const data = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { id: true, name: true, email: true, phone: true, role: true }
    });
    
    if (!data) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const createParkingRequest = async (req, res) => {
  console.log('createParkingRequest called');
  try {
    const { user_id, vehicle_id, site_id, payment_amount } = req.body;

    const existingSession = await prisma.parkingSession.findFirst({
      where: {
        user_id,
        status: { in: ['active', 'retrieval_requested'] }
      }
    });

    if (existingSession) {
      return res.status(400).json({ 
        success: false, 
        error: 'You already have an active parking session. Please complete it before creating a new one.' 
      });
    }

    const site = await prisma.parkingSite.findUnique({
      where: { id: site_id },
      select: { fixed_parking_fee: true }
    });

    if (!site) throw new Error('Parking site not found');

    const parkingFee = payment_amount || site.fixed_parking_fee;
    console.log('Site:', site);
    console.log('Parking fee:', parkingFee);

    const session = await prisma.parkingSession.create({
      data: {
        user_id,
        vehicle_id,
        site_id,
        entry_time: new Date().toISOString(),
        status: 'active',
        payment_status: 'completed',
        payment_amount: parkingFee
      },
      include: {
        user: { select: { name: true, phone: true } },
        vehicle: { select: { vehicle_name: true, plate_number: true } },
        parking_site: { select: { name: true, address: true } }
      }
    });

    await prisma.parkingPayment.create({
      data: {
        session_id: session.id,
        user_id,
        amount: parkingFee,
        payment_method: 'card',
        payment_status: 'completed',
        transaction_id: `PARK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        paid_at: new Date().toISOString()
      }
    });

    const responseSession = {
      ...session,
      parking_fee: parkingFee,
      payment_amount: parkingFee,
      users: session.user,
      vehicles: session.vehicle,
      parking_sites: session.parking_site
    };
    delete responseSession.user;
    delete responseSession.vehicle;
    delete responseSession.parking_site;

    res.status(201).json({ success: true, data: { session: responseSession, parking_fee: parkingFee } });
  } catch (error) {
    console.error('Create parking request error:', error);
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const getMySession = async (req, res) => {
  try {
    const data = await prisma.parkingSession.findFirst({
      where: {
        user_id: req.params.userId,
        status: { in: ['active', 'retrieval_requested'] }
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
};

export const requestRetrieval = async (req, res) => {
  try {
    const { session_id, user_id } = req.body;

    const session = await prisma.parkingSession.findFirst({
      where: {
        id: session_id,
        user_id
      }
    });

    if (!session) throw new Error('Session not found');
    if (session.payment_status !== 'completed') throw new Error('Payment required before retrieval');

    await prisma.$transaction([
      prisma.valetAssignment.create({
        data: {
          session_id,
          driver_id: null,
          assignment_type: 'retrieve',
          status: 'assigned',
          assigned_at: new Date().toISOString()
        }
      }),
      prisma.parkingSession.update({
        where: { id: session_id },
        data: { status: 'retrieval_requested' }
      })
    ]);

    res.json({ success: true, message: 'Retrieval request submitted successfully' });
  } catch (error) {
    console.error('Request retrieval error:', error);
    res.status(400).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const mockPayment = async (req, res) => {
  try {
    const { session_id, amount } = req.body;

    const data = await prisma.parkingSession.update({
      where: { id: session_id },
      data: {
        payment_status: 'completed',
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
};

export const getMyHistory = async (req, res) => {
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
};

export const createVehicle = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { vehicle_name, plate_number, vehicle_type } = req.body;

    if (!vehicle_name || !plate_number) {
      return res.status(400).json({ success: false, error: 'vehicle_name and plate_number are required' });
    }

    const data = await prisma.vehicle.create({
      data: {
        user_id: userId,
        vehicle_name,
        plate_number,
        vehicle_type: vehicle_type || 'sedan'
      }
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const { vehicle_name, plate_number, vehicle_type } = req.body;

    const updatePayload = {};
    if (vehicle_name !== undefined) updatePayload.vehicle_name = vehicle_name;
    if (plate_number !== undefined) updatePayload.plate_number = plate_number;
    if (vehicle_type !== undefined) updatePayload.vehicle_type = vehicle_type;

    const data = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updatePayload
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;

    const data = await prisma.vehicle.delete({
      where: { id: vehicleId }
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const getParkingSession = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const data = await prisma.parkingSession.findFirst({
      where: {
        user_id: userId,
        status: { in: ['retrieval_requested', 'in_transit', 'ready_for_retrieval'] }
      },
      include: {
        vehicle: { select: { vehicle_name: true, plate_number: true } },
        parking_site: { select: { name: true, address: true } }
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
};

export const completeParkingSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const data = await prisma.parkingSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        exit_time: new Date().toISOString()
      }
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};
