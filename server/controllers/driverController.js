import supabase from '../config/supabase.js';
import friendlyErrorMessage from '../utils/friendlyError.js';

export const getDriverRequests = async (req, res) => {
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
      .eq('status', 'assigned')
      .order('assigned_at', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const getDriverActiveAssignments = async (req, res) => {
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
      .eq('driver_id', req.params.driverId)
      .in('status', ['in_progress'])
      .order('assigned_at', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { driver_id } = req.body;

    const { data, error } = await supabase
      .from('valet_assignments')
      .update({
        status: 'in_progress',
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
};

export const completeParking = async (req, res) => {
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
};

export const completeRetrieval = async (req, res) => {
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
};

export const getDriverDetails = async (req, res) => {
  try {
    const { driverId } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role')
      .eq('id', driverId)
      .eq('role', 'driver')
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const getAllDrivers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, is_available, created_at')
      .eq('role', 'driver')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const createDriver = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const { data, error } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        phone,
        role: 'driver',
        is_available: true
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { name, email, phone, is_available } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        email,
        phone,
        is_available
      })
      .eq('id', driverId)
      .eq('role', 'driver')
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', driverId)
      .eq('role', 'driver');

    if (error) throw error;
    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};