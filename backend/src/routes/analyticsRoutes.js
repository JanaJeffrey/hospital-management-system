import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  getPatientStats, 
  getDoctorStats, 
  getWeeklyTrends,
  getPatientPrescriptions,
  getPatientLabReports
} from '../controllers/analyticsController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get stats for dashboard (role-based)
router.get('/stats', (req, res) => {
  const userRole = req.user.role?.toLowerCase();
  if (userRole === 'doctor') {
    return getDoctorStats(req, res);
  }
  return getPatientStats(req, res);
});

// Get weekly appointment trends
router.get('/trends', getWeeklyTrends);

// Get patient prescriptions
router.get('/prescriptions', getPatientPrescriptions);

// Get patient lab reports
router.get('/lab-reports', getPatientLabReports);

export default router;