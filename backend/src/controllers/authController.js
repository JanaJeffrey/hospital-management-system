import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendDoctorApprovalEmail, sendDoctorRejectionEmail } from '../utils/email.js';

const prisma = new PrismaClient();

// ============================================
// REGISTER - Create a new user
// ============================================
export const register = async (req, res) => {
  try {
    console.log('📝 Registration request received');
    console.log('📋 Body:', req.body);
    console.log('📎 File:', req.file);

    const {
      email,
      password,
      name,
      role,
      licenseNumber,
      specialization,
      yearsExperience
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      if (existingUser.status === 'REJECTED') {
        return res.status(400).json({
          error: 'This email was previously rejected. Please contact support.',
          status: 'REJECTED'
        });
      }
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (licenseNumber) {
      const rejectedLicense = await prisma.user.findFirst({
        where: {
          licenseNumber: licenseNumber,
          status: 'REJECTED'
        }
      });
      if (rejectedLicense) {
        return res.status(400).json({
          error: 'This license number was previously rejected. Please contact support.',
          status: 'REJECTED'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userStatus = 'ACTIVE';
    let doctorData = {};
    let certificateUrl = null;

    if (role === 'doctor') {
      if (!licenseNumber || !specialization || !yearsExperience) {
        return res.status(400).json({
          error: 'Doctors must provide license number, specialization, and years of experience'
        });
      }

      const existingLicense = await prisma.user.findFirst({
        where: {
          licenseNumber: licenseNumber,
          status: { not: 'REJECTED' }
        }
      });

      if (existingLicense) {
        return res.status(400).json({ error: 'License number already registered' });
      }

      userStatus = 'PENDING';

      if (req.file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        certificateUrl = `${baseUrl}/uploads/certificates/${req.file.filename}`;
        console.log('✅ Certificate saved at:', certificateUrl);
      }

      doctorData = {
        licenseNumber,
        specialization,
        yearsExperience: parseInt(yearsExperience),
        certificateUrl: certificateUrl
      };
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role === 'doctor' ? 'DOCTOR' : role === 'admin' ? 'ADMIN' : 'PATIENT',
        status: role === 'admin' ? 'ACTIVE' : userStatus,
        ...doctorData
      }
    });

    console.log('✅ User created:', user.id);

    if (userStatus === 'PENDING') {
      return res.status(201).json({
        message: 'Doctor registration submitted for review. You will be notified once approved.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          certificateUrl: certificateUrl
        }
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// ============================================
// LOGIN - With role enforcement
// ============================================
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log(`🔐 Login attempt: ${email} as ${role}`);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userRole = user.role?.toLowerCase();
    const loginRole = role?.toLowerCase();

    if (userRole !== loginRole) {
      return res.status(403).json({
        error: 'Login details do not match account type'
      });
    }

    if (user.status === 'PENDING') {
      return res.status(403).json({
        error: 'Your account is pending approval. You will be notified once verified.'
      });
    }

    if (user.status === 'REJECTED') {
      return res.status(403).json({
        error: 'Your account has been rejected. Please contact support.'
      });
    }

    if (user.status === 'DEACTIVATED') {
      return res.status(403).json({
        error: 'Your account has been deactivated. Please contact support.'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        rejectionReason: user.rejectionReason
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ============================================
// GET ALL DOCTORS (Admin)
// ============================================
export const getAllDoctors = async (req, res) => {
  try {
    const allDoctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        licenseNumber: true,
        specialization: true,
        yearsExperience: true,
        certificateUrl: true,
        createdAt: true,
        status: true,
        rejectionReason: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(allDoctors);
  } catch (error) {
    console.error('Error fetching all doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

// ============================================
// GET PENDING DOCTORS (Admin)
// ============================================
export const getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        status: 'PENDING'
      },
      select: {
        id: true,
        name: true,
        email: true,
        licenseNumber: true,
        specialization: true,
        yearsExperience: true,
        certificateUrl: true,
        createdAt: true,
        status: true,
        rejectionReason: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(pendingDoctors);
  } catch (error) {
    console.error('Error fetching pending doctors:', error);
    res.status(500).json({ error: 'Failed to fetch pending doctors' });
  }
};

// ============================================
// GET ALL USERS (Admin) - Patients, Doctors, Admins
// ============================================
export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        licenseNumber: true,
        specialization: true,
        yearsExperience: true,
        certificateUrl: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const patients = allUsers.filter(u => u.role === 'PATIENT');
    const doctors = allUsers.filter(u => u.role === 'DOCTOR');
    const admins = allUsers.filter(u => u.role === 'ADMIN');
    const pending = allUsers.filter(u => u.status === 'PENDING');
    const rejected = allUsers.filter(u => u.status === 'REJECTED');
    const active = allUsers.filter(u => u.status === 'ACTIVE');

    res.json({
      users: allUsers,
      counts: {
        total: allUsers.length,
        patients: patients.length,
        doctors: doctors.length,
        admins: admins.length,
        pending: pending.length,
        rejected: rejected.length,
        active: active.length
      }
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ============================================
// APPROVE OR REJECT DOCTOR
// ============================================
export const updateDoctorStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['ACTIVE', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be ACTIVE or REJECTED' });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: parseInt(doctorId) }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({ error: 'Please provide a reason for rejection' });
    }

    const updatedDoctor = await prisma.user.update({
      where: { id: parseInt(doctorId) },
      data: {
        status: status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      }
    });

    try {
      if (status === 'ACTIVE') {
        await sendDoctorApprovalEmail(doctor.email, doctor.name);
        console.log(`✅ Approval email sent to ${doctor.email}`);
      } else if (status === 'REJECTED') {
        await sendDoctorRejectionEmail(doctor.email, doctor.name, rejectionReason);
        console.log(`✅ Rejection email sent to ${doctor.email} with reason`);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    res.json({
      message: `Doctor ${status.toLowerCase()} successfully`,
      doctor: {
        id: updatedDoctor.id,
        name: updatedDoctor.name,
        email: updatedDoctor.email,
        status: updatedDoctor.status,
        rejectionReason: updatedDoctor.rejectionReason
      }
    });
  } catch (error) {
    console.error('Error updating doctor status:', error);
    res.status(500).json({ error: 'Failed to update doctor status' });
  }
};

// ============================================
// UPDATE PROFILE
// ============================================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          id: { not: userId }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use by another account' });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        rejectionReason: user.rejectionReason
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// ============================================
// DEACTIVATE ACCOUNT
// ============================================
export const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'DEACTIVATED' }
    });

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating account:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
};

// ============================================
// DELETE ACCOUNT
// ============================================
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.$transaction([
      prisma.appointment.deleteMany({ where: { patientId: userId } }),
      prisma.appointment.deleteMany({ where: { doctorId: userId } }),
      prisma.patientPrescription.deleteMany({ where: { patientId: userId } }),
      prisma.patientPrescription.deleteMany({ where: { doctorId: userId } }),
      prisma.patientLabReport.deleteMany({ where: { patientId: userId } }),
      prisma.patientLabReport.deleteMany({ where: { doctorId: userId } }),
      prisma.notification.deleteMany({ where: { userId: userId } }),
      prisma.patientRecord.deleteMany({ where: { patientId: userId } }),
      prisma.doctorSchedule.deleteMany({ where: { doctorId: userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

// ============================================
// REACTIVATE ACCOUNT
// ============================================
export const reactivateAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' }
    });

    res.json({
      message: 'Account reactivated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error reactivating account:', error);
    res.status(500).json({ error: 'Failed to reactivate account' });
  }
};