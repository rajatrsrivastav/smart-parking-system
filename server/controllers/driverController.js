import prisma from '../config/database.js';
import friendlyErrorMessage from '../utils/friendlyError.js';

export const getDriverRequests = async (req, res) => {
  try {
    const data = await prisma.valetAssignment.findMany({
      where: { status: 'assigned' },
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
};

export const getDriverActiveAssignments = async (req, res) => {
  try {
    const data = await prisma.valetAssignment.findMany({
      where: {
        driver_id: req.params.driverId,
        status: 'in_progress'
      },
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
};

export const acceptRequest = async (req, res) => {
  try {
    const { driver_id } = req.body;

    if (!driver_id) {
      return res.status(400).json({ success: false, error: 'Driver ID is required' });
    }

    const data = await prisma.valetAssignment.update({
      where: { id: req.params.requestId },
      data: {
        status: 'in_progress',
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

    if (!data) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    // Update parking session status based on assignment type
    await prisma.parkingSession.update({
      where: { id: data.session_id },
      data: { status: 'in_transit' }
    });

    // Transform to match Supabase response format
    const transformedData = {
      id: data.id,
      session_id: data.session_id,
      driver_id: data.driver_id,
      assignment_type: data.assignment_type,
      status: data.status,
      assigned_at: data.assigned_at,
      parking_sessions: {
        id: data.parking_session.id,
        status: 'in_transit',
        user_id: data.parking_session.user_id,
        vehicle_id: data.parking_session.vehicle_id,
        site_id: data.parking_session.site_id,
        users: data.parking_session.user,
        vehicles: data.parking_session.vehicle,
        parking_sites: data.parking_session.parking_site
      }
    };

    res.json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ success: false, error: error.message || friendlyErrorMessage(error) });
  }
};

export const completeParking = async (req, res) => {
  try {
    const { assignment_id, parking_spot } = req.body;

    if (!assignment_id) {
      return res.status(400).json({ success: false, error: 'Assignment ID is required' });
    }

    const assignment = await prisma.valetAssignment.findUnique({
      where: { id: assignment_id },
      select: { session_id: true }
    });

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    const session = await prisma.parkingSession.findUnique({
      where: { id: assignment.session_id },
      select: { site_id: true }
    });

    // Use transaction for multiple operations
    const [updatedSession, data] = await prisma.$transaction([
      prisma.parkingSession.update({
        where: { id: assignment.session_id },
        data: {
          status: 'active',
          parking_spot
        }
      }),
      prisma.valetAssignment.update({
        where: { id: assignment_id },
        data: {
          status: 'completed',
          completed_at: new Date().toISOString()
        }
      })
    ]);

    // Decrement available slots
    if (session) {
      await prisma.parkingSite.update({
        where: { id: session.site_id },
        data: { available_slots: { decrement: 1 } }
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error completing parking:', error);
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const completeRetrieval = async (req, res) => {
  try {
    const { assignment_id } = req.body;

    if (!assignment_id) {
      return res.status(400).json({ success: false, error: 'Assignment ID is required' });
    }

    const assignment = await prisma.valetAssignment.findUnique({
      where: { id: assignment_id },
      select: { session_id: true }
    });

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    const session = await prisma.parkingSession.findUnique({
      where: { id: assignment.session_id },
      select: { site_id: true }
    });

    // Use transaction for multiple operations
    const [updatedSession, data] = await prisma.$transaction([
      prisma.parkingSession.update({
        where: { id: assignment.session_id },
        data: { status: 'ready_for_retrieval' }
      }),
      prisma.valetAssignment.update({
        where: { id: assignment_id },
        data: {
          status: 'completed',
          completed_at: new Date().toISOString()
        }
      })
    ]);

    // Increment available slots
    if (session) {
      await prisma.parkingSite.update({
        where: { id: session.site_id },
        data: { available_slots: { increment: 1 } }
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error completing retrieval:', error);
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const getDriverDetails = async (req, res) => {
  try {
    const { driverId } = req.params;

    const data = await prisma.user.findFirst({
      where: {
        id: driverId,
        role: 'driver'
      },
      select: { id: true, name: true, email: true, phone: true, role: true }
    });

    if (!data) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const getAllDrivers = async (req, res) => {
  try {
    const data = await prisma.user.findMany({
      where: { role: 'driver' },
      select: { id: true, name: true, email: true, phone: true, role: true, created_at: true },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const createDriver = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const data = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: 'driver'
      }
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { name, email, phone } = req.body;

    const data = await prisma.user.update({
      where: {
        id: driverId
      },
      data: {
        name,
        email,
        phone
      }
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    await prisma.user.delete({
      where: {
        id: driverId
      }
    });

    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};
