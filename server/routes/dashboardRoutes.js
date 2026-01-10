import express from 'express';
import {
  getManagerDashboard,
  getSuperAdminDashboard,
  getParkingHistory,
  getParkingSessionsByStatus
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/manager/dashboard', getManagerDashboard);
router.get('/parking-history', getParkingHistory);
router.get('/parking-sessions', getParkingSessionsByStatus);
router.get('/super-admin/dashboard', getSuperAdminDashboard);

export default router;