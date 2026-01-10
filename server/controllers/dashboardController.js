import supabase from '../config/supabase.js';
import friendlyErrorMessage from '../utils/friendlyError.js';

export const getManagerDashboard = async (req, res) => {
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
};

export const getParkingHistory = async (req, res) => {
  try {
    const { data: sessions } = await supabase
      .from('parking_sessions')
      .select(`
        *,
        vehicles(vehicle_name, plate_number),
        users(name, phone),
        parking_sites(name, address)
      `)
      .eq('status', 'completed')
      .order('entry_time', { ascending: false })
      .limit(10);

    const totalBookings = sessions?.length || 0;

    res.json({
      success: true,
      data: {
        totalBookings,
        history: sessions || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const getParkingSessionsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('parking_sessions')
      .select(`
        *,
        vehicles(vehicle_name, plate_number),
        users(name, phone),
        parking_sites(name, address),
        valet_assignments(status, assignment_type, driver_id, users(name))
      `);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: sessions } = await query
      .order('entry_time', { ascending: false });

    res.json({
      success: true,
      data: sessions || []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const getSuperAdminDashboard = async (req, res) => {
  try {
    const { siteId } = req.query;
    const today = new Date().toISOString().split('T')[0];

    let todayQuery = supabase
      .from('parking_sessions')
      .select('payment_amount')
      .gte('entry_time', `${today}T00:00:00`);

    if (siteId) {
      todayQuery = todayQuery.eq('site_id', siteId);
    }

    const { data: todaySessions } = await todayQuery;

    const ticketsIssued = todaySessions?.length || 0;
    const collection = todaySessions
      ?.filter(s => s.payment_amount)
      .reduce((sum, s) => sum + s.payment_amount, 0) || 0;

    let totalQuery = supabase
      .from('parking_sessions')
      .select('payment_amount');

    if (siteId) {
      totalQuery = totalQuery.eq('site_id', siteId);
    }

    const { data: allSessions } = await totalQuery;

    const totalTickets = allSessions?.length || 0;
    const totalCollection = allSessions?.reduce((sum, s) => sum + (s.payment_amount || 0), 0) || 0;

    let activeQuery = supabase
      .from('parking_sessions')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    if (siteId) {
      activeQuery = activeQuery.eq('site_id', siteId);
    }

    const { count: activeParkingCount } = await activeQuery;

    let sitesQuery = supabase
      .from('parking_sites')
      .select('*');

    if (siteId) {
      sitesQuery = sitesQuery.eq('id', siteId);
    }

    const { data: sites } = await sitesQuery;

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