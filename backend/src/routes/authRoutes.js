import express from 'express';
import { 
  register, 
  login, 
  getPendingDoctors, 
  getAllDoctors,
  getAllUsers,
  updateDoctorStatus,
  updateProfile,
  changePassword,
  deactivateAccount,
  deleteAccount,
  reactivateAccount
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roleCheck.js';
import { uploadCertificate } from '../middleware/upload.js';

const router = express.Router();

// PUBLIC ROUTES
router.post('/register', uploadCertificate, register);
router.post('/login', login);

// ADMIN ONLY ROUTES
router.get('/pending-doctors', authenticate, isAdmin, getPendingDoctors);
router.get('/all-doctors', authenticate, isAdmin, getAllDoctors);
router.get('/all-users', authenticate, isAdmin, getAllUsers);
router.put('/doctors/:doctorId/status', authenticate, isAdmin, updateDoctorStatus);

// PROTECTED ROUTES
router.put('/update-profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.put('/deactivate', authenticate, deactivateAccount);
router.delete('/delete-account', authenticate, deleteAccount);
router.put('/reactivate', authenticate, reactivateAccount);

export default router;