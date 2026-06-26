import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  getMyAppointments,
  getDoctorAppointments,
  getDoctors,
  bookAppointment,
  cancelAppointment,
  updateAppointmentStatus
} from '../controllers/appointmentController.js';

const router = express.Router();

// ============================================
// ALL routes require authentication
// ============================================
router.use(authenticate);

// ============================================
// PATIENT ROUTES
// ============================================

// GET /api/appointments/my - Get all appointments for the logged-in patient
router.get('/my', getMyAppointments);

// GET /api/appointments/doctors - Get all doctors (for booking dropdown)
router.get('/doctors', getDoctors);

// POST /api/appointments/book - Book a new appointment
router.post('/book', bookAppointment);

// ============================================
// DOCTOR ROUTES
// ============================================

// GET /api/appointments/doctor - Get all appointments for the logged-in doctor
router.get('/doctor', getDoctorAppointments);

// ============================================
// SHARED ROUTES (both patient and doctor can cancel)
// ============================================

// PUT /api/appointments/:id/cancel - Cancel an appointment
router.put('/:id/cancel', cancelAppointment);

// PUT /api/appointments/:id/status - Update appointment status (doctor only)
router.put('/:id/status', updateAppointmentStatus);

export default router;