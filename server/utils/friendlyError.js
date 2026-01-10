export default function friendlyErrorMessage(err) {
  if (!err) return 'Something went wrong. Please try again.';
  const msg = (err.message || String(err)).toLowerCase();

  if (/duplicate key value|unique constraint|violates unique constraint|vehicles_plate_number_key|already exists/.test(msg)) {
    return 'A vehicle with that plate number already exists.';
  }
  if (/payment required/.test(msg)) return 'Payment is required before retrieval.';
  if (/not found/.test(msg)) return 'Requested item not found.';
  if (/pgrst116/.test(msg)) return 'No records found.';

  return 'Something went wrong. Please try again.';
}
