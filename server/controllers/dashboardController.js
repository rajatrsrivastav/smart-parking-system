import prisma from '../config/database.js';
import friendlyErrorMessage from '../utils/friendlyError.js';

export const getManagerDashboard = async (req, res) => {
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
};

export const getParkingHistory = async (req, res) => {
  try {
    const sessions = await prisma.parkingSession.findMany({
      where: { status: 'completed' },
      include: {
        vehicle: { select: { vehicle_name: true, plate_number: true } },
        user: { select: { name: true, phone: true } },
        parking_site: { select: { name: true, address: true } }
      },
      orderBy: { entry_time: 'desc' },
      take: 10
    });

    const totalBookings = sessions?.length || 0;

    // Transform to match Supabase response format
    const transformedSessions = sessions.map(session => ({
      ...session,
      vehicles: session.vehicle,
      users: session.user,
      parking_sites: session.parking_site
    }));

    transformedSessions.forEach(item => {
      delete item.vehicle;
      delete item.user;
      delete item.parking_site;
    });

    res.json({
      success: true,
      data: {
        totalBookings,
        history: transformedSessions || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const getParkingSessionsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = status && status !== 'all' ? { status } : {};

    const sessions = await prisma.parkingSession.findMany({
      where: whereClause,
      include: {
        vehicle: { select: { vehicle_name: true, plate_number: true } },
        user: { select: { name: true, phone: true } },
        parking_site: { select: { name: true, address: true } },
        valet_assignments: {
          select: {
            status: true,
            assignment_type: true,
            driver_id: true,
            driver: { select: { name: true } }
          }
        }
      },
      orderBy: { entry_time: 'desc' }
    });

    // Transform to match Supabase response format
    const transformedSessions = sessions.map(session => {
      const transformed = {
        ...session,
        vehicles: session.vehicle,
        users: session.user,
        parking_sites: session.parking_site,
        valet_assignments: session.valet_assignments.map(va => ({
          ...va,
          users: va.driver
        }))
      };
      
      delete transformed.vehicle;
      delete transformed.user;
      delete transformed.parking_site;
      
      transformed.valet_assignments.forEach(va => {
        delete va.driver;
      });
      
      return transformed;
    });

    res.json({
      success: true,
      data: transformedSessions || []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const getSuperAdminDashboard = async (req, res) => {
  try {
    const { siteId } = req.query;
    const today = new Date().toISOString().split('T')[0];

    const todayWhere = {
      entry_time: { gte: `${today}T00:00:00` },
      ...(siteId && { site_id: siteId })
    };

    const todaySessions = await prisma.parkingSession.findMany({
      where: todayWhere,
      select: { payment_amount: true }
    });

    const ticketsIssued = todaySessions?.length || 0;
    const collection = todaySessions
      ?.filter(s => s.payment_amount)
      .reduce((sum, s) => sum + parseFloat(s.payment_amount), 0) || 0;

    const totalWhere = siteId ? { site_id: siteId } : {};

    const allSessions = await prisma.parkingSession.findMany({
      where: totalWhere,
      select: { payment_amount: true }
    });

    const totalTickets = allSessions?.length || 0;
    const totalCollection = allSessions?.reduce((sum, s) => sum + (parseFloat(s.payment_amount) || 0), 0) || 0;

    const activeWhere = {
      status: 'active',
      ...(siteId && { site_id: siteId })
    };

    const activeParkingCount = await prisma.parkingSession.count({
      where: activeWhere
    });

    const sitesWhere = siteId ? { id: siteId } : {};

    const sites = await prisma.parkingSite.findMany({
      where: sitesWhere
    });

    res.json({
      success: true,
      data: {
        todayPerformance: {
          ticketsIssued,
          collection
        },
        statistics: {
          totalTickets: totalTickets || 0,
          totalCollection: totalCollection || 0,
          activeParking: activeParkingCount || 0
        },
        sites: sites || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};
