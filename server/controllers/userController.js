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

export const getUserProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role')
      .eq('id', req.params.userId)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const createParkingRequest = async (req, res) => {
  console.log('createParkingRequest called');
  try {
    const { user_id, vehicle_id, site_id, payment_amount } = req.body;

    const { data: existingSession, error: checkError } = await supabase
      .from('parking_sessions')
      .select('id, status')
      .eq('user_id', user_id)
      .in('status', ['active', 'retrieval_requested'])
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    if (existingSession) {
      return res.status(400).json({ 
        success: false, 
        error: 'You already have an active parking session. Please complete it before creating a new one.' 
      });
    }

    const { data: site, error: siteError } = await supabase
      .from('parking_sites')
      .select('fixed_parking_fee')
      .eq('id', site_id)
      .single();

    if (siteError) throw siteError;
    if (!site) throw new Error('Parking site not found');

    const parkingFee = payment_amount || site.fixed_parking_fee;
    console.log('Site:', site);
    console.log('Parking fee:', parkingFee);

    const { data: session, error: sessionError } = await supabase
      .from('parking_sessions')
      .insert([{
        user_id,
        vehicle_id,
        site_id,
        entry_time: new Date().toISOString(),
        status: 'active',
        payment_status: 'completed',
        payment_amount: parkingFee,
        parking_fee: parkingFee
      }])
      .select(`
        id, user_id, vehicle_id, site_id, parking_spot, entry_time, exit_time, payment_amount, payment_method, payment_status, status, created_at, updated_at,
        users(name, phone),
        vehicles(vehicle_name, plate_number),
        parking_sites(name, address, fixed_parking_fee)
      `)
      .single();

    if (sessionError) throw sessionError;

    const { error: paymentError } = await supabase
      .from('parking_payments')
      .insert([{
        session_id: session.id,
        user_id,
        amount: parkingFee,
        payment_method: 'card',
        payment_status: 'completed',
        transaction_id: `PARK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        paid_at: new Date().toISOString()
      }]);

    if (paymentError) throw paymentError;
    const responseSession = {
      ...session,
      parking_fee: parkingFee,
      payment_amount: parkingFee
    };

    res.status(201).json({ success: true, data: { session: responseSession, parking_fee: parkingFee } });
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
      .in('status', ['active', 'retrieval_requested'])
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
    if (session.payment_status !== 'completed') throw new Error('Payment required before retrieval');

    // Create valet assignment for retrieval
    const { data: assignment, error: assignmentError } = await supabase
      .from('valet_assignments')
      .insert([{
        session_id,
        driver_id: null,
        assignment_type: 'retrieve',
        status: 'assigned',  // Changed from 'pending' temporarily
        assigned_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (assignmentError) throw assignmentError;

    // Update the session status to indicate retrieval requested
    const { error: updateError } = await supabase
      .from('parking_sessions')
      .update({ status: 'retrieval_requested' })
      .eq('id', session_id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    res.json({ success: true, message: 'Retrieval request submitted successfully' });
  } catch (error) {
    console.error('Request retrieval error:', error);
    res.status(400).json({ success: false, error: friendlyErrorMessage(error) });
  }
};

export const mockPayment = async (req, res) => {
  try {
    const { session_id, amount } = req.body;

    const { data, error } = await supabase
      .from('parking_sessions')
      .update({
        payment_status: 'completed',
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