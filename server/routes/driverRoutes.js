import express from 'express';
import {
  getDriverRequests,
  acceptRequest,
  completeParking,
  completeRetrieval,
  getDriverDetails,
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverActiveAssignments
} from '../controllers/driverController.js';

const router = express.Router();

router.get('/driver/requests', getDriverRequests);
router.get('/driver/:driverId/active', getDriverActiveAssignments);
router.get('/driver/:driverId', getDriverDetails);
router.get('/drivers', getAllDrivers);
router.post('/drivers', createDriver);
router.put('/drivers/:driverId', updateDriver);
router.delete('/drivers/:driverId', deleteDriver);
router.post('/driver/accept/:requestId', acceptRequest);
router.post('/driver/complete-parking', completeParking);
router.post('/driver/complete-retrieval', completeRetrieval);

export default router;