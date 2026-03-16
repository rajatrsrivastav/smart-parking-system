const friendlyErrorMessage = (err) => {
  if (!err) return 'Something went wrong. Please try again.';
  
  // Handle Prisma-specific errors
  if (err.code) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      if (field.includes('plate_number') || field.includes('email')) {
        return `A record with that ${field} already exists.`;
      }
      return 'A record with that value already exists.';
    }
    
    // Foreign key constraint violation
    if (err.code === 'P2003') {
      return 'Related record not found.';
    }
    
    // Record not found
    if (err.code === 'P2025') {
      return 'Requested item not found.';
    }
    
    // Invalid input
    if (err.code === 'P2000') {
      return 'Invalid input provided.';
    }
    
    // Null constraint violation
    if (err.code === 'P2011') {
      return 'Required field is missing.';
    }
    
    // Connection error
    if (err.code === 'P1001' || err.code === 'P1002') {
      return 'Database connection error. Please try again.';
    }
  }
  
  // Handle general error messages
  const msg = (err.message || String(err)).toLowerCase();
  
  if (/duplicate key value|unique constraint|violates unique constraint|already exists/.test(msg)) {
    return 'A record with that value already exists.';
  }
  if (/payment required/.test(msg)) return 'Payment is required before retrieval.';
  if (/not found/.test(msg)) return 'Requested item not found.';
  if (/foreign key/.test(msg)) return 'Related record not found.';
  if (/invalid/.test(msg)) return 'Invalid input provided.';

  return 'Something went wrong. Please try again.';
};

export default friendlyErrorMessage;
