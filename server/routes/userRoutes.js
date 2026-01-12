import express from 'express';
import {
  getSites,
  getUserVehicles,
  getUserProfile,
  createVehicle,
  createParkingRequest,
  getMySession,
  requestRetrieval,
  mockPayment,
  getMyHistory,
  getParkingSession,
  completeParkingSession
} from '../controllers/userController.js';

const router = express.Router();

router.get('/sites', getSites);
router.get('/users/:userId/profile', getUserProfile);
router.get('/users/:userId/vehicles', getUserVehicles);
router.post('/users/:userId/vehicles', createVehicle);
router.post('/parking-request', createParkingRequest);
router.get('/my-session/:userId', getMySession);
router.get('/parking-session/:userId', getParkingSession);
router.post('/complete-parking-session', completeParkingSession);
router.post('/request-retrieval', requestRetrieval);
router.post('/mock-payment', mockPayment);
router.get('/my-history/:userId', getMyHistory);

router.put('/vehicles/:vehicleId', async (req, res, next) => {
  try {
    const { updateVehicle } = await import('../controllers/userController.js');
    return updateVehicle(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.delete('/vehicles/:vehicleId', async (req, res, next) => {
  try {
    const { deleteVehicle } = await import('../controllers/userController.js');
    return deleteVehicle(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;