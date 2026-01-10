import supabase from '../config/supabase.js';

const friendlyErrorMessage = (err) => {
  if (!err) return 'Something went wrong. Please try again.';
  const msg = (err.message || String(err)).toLowerCase();

  if (/duplicate key value|unique constraint|violates unique constraint|vehicles_plate_number_key|already exists/.test(msg)) {
    return 'A vehicle with that plate number already exists.';
  }
  if (/payment required/.test(msg)) return 'Payment is required before retrieval.';
  if (/not found/.test(msg)) return 'Requested item not found.';
  if (/pgrst116/.test(msg)) return 'No records found.';

  return 'Something went wrong. Please try again.';
};

export const getSites = async (req, res) => {
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
};

export const getUserVehicles = async (req, res) => {
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
};

export const createParkingRequest = async (req, res) => {
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
};

export const getMySession = async (req, res) => {
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
};

export const requestRetrieval = async (req, res) => {
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
};

export const mockPayment = async (req, res) => {
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
};

export const getMyHistory = async (req, res) => {
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
};

export const createVehicle = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { vehicle_name, plate_number, vehicle_type } = req.body;

    if (!vehicle_name || !plate_number) {
      return res.status(400).json({ success: false, error: 'vehicle_name and plate_number are required' });
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert([{
        user_id: userId,
        vehicle_name,
        plate_number,
        vehicle_type: vehicle_type || 'sedan'
      }])
      .select()
      .single();

    if (error) throw error;
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

    const { data, error } = await supabase
      .from('vehicles')
      .update(updatePayload)
      .eq('id', vehicleId)
      .select();

    if (error) throw error;
    const result = Array.isArray(data) ? data[0] : data;
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;

    const { data, error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)
      .select();

    if (error) throw error;
    const result = Array.isArray(data) ? data[0] : data;
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};