import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// GET PATIENT DASHBOARD STATS
// ============================================
export const getPatientStats = async (req, res) => {
  try {
    const patientId = req.user.userId;
    
    // Get all appointments for this patient
    const appointments = await prisma.appointment.findMany({
      where: { patientId: patientId },
      include: {
        doctor: { select: { name: true, email: true } }
      },
      orderBy: { dateTime: 'asc' }
    });
    
    // Get prescriptions
    const prescriptions = await prisma.patientPrescription.findMany({
      where: { patientId: patientId },
      include: {
        doctor: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // ✅ FIXED: Get lab reports
    const labReports = await prisma.patientLabReport.findMany({
      where: { patientId: patientId },
      include: {
        doctor: { select: { name: true, email: true } }
      },
      orderBy: { date: 'desc' }
    });
    
    // Calculate stats
    const totalAppointments = appointments.length;
    const upcomingAppointments = appointments.filter(a => 
      a.status !== 'CANCELLED' && new Date(a.dateTime) > new Date()
    ).length;
    const completedAppointments = appointments.filter(a => a.status === 'COMPLETED').length;
    
    const activePrescriptions = prescriptions.filter(p => p.status === 'ACTIVE').length;
    const readyReports = labReports.filter(r => r.status === 'READY').length;
    
    res.json({
      appointments: {
        total: totalAppointments,
        upcoming: upcomingAppointments,
        completed: completedAppointments,
        list: appointments
      },
      prescriptions: {
        active: activePrescriptions,
        total: prescriptions.length,
        list: prescriptions
      },
      labReports: {
        ready: readyReports,
        total: labReports.length,
        list: labReports
      }
    });
    
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    res.status(500).json({ error: 'Failed to fetch patient stats' });
  }
};

// ============================================
// GET DOCTOR STATS
// ============================================
export const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    
    // Get all appointments for this doctor
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctorId },
      include: {
        patient: { select: { name: true, email: true } }
      },
      orderBy: { dateTime: 'asc' }
    });
    
    // ✅ NEW: Get prescriptions written by this doctor
    const prescriptions = await prisma.patientPrescription.findMany({
      where: { doctorId: doctorId },
      include: {
        patient: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // ✅ NEW: Get lab reports ordered by this doctor
    const labReports = await prisma.patientLabReport.findMany({
      where: { doctorId: doctorId },
      include: {
        patient: { select: { name: true, email: true } }
      },
      orderBy: { date: 'desc' }
    });
    
    // Calculate stats
    const uniquePatients = new Set(appointments.map(a => a.patientId));
    
    const today = new Date().toDateString();
    const todayAppointments = appointments.filter(a => 
      new Date(a.dateTime).toDateString() === today && a.status !== 'CANCELLED'
    );
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyApps = appointments.filter(a => 
      new Date(a.dateTime) > weekAgo && a.status !== 'CANCELLED'
    );
    
    const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
    const totalActive = appointments.filter(a => a.status !== 'CANCELLED').length;
    const completionRate = totalActive > 0 ? Math.round((completedCount / totalActive) * 100) : 0;
    
    // ✅ NEW: Count pending lab reports
    const pendingReports = labReports.filter(r => r.status === 'PENDING').length;
    
    res.json({
      overview: {
        totalPatients: uniquePatients.size,
        todayPatients: todayAppointments.length,
        weeklyAppointments: weeklyApps.length,
        completionRate: `${completionRate}%`,
        totalAppointments: appointments.length,
        pendingReports: pendingReports,
        totalPrescriptions: prescriptions.length,
        totalLabReports: labReports.length
      },
      appointments: appointments.slice(0, 10),
      prescriptions: prescriptions.slice(0, 10),
      labReports: labReports.slice(0, 10)
    });
    
  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ error: 'Failed to fetch doctor stats' });
  }
};

// ============================================
// GET WEEKLY APPOINTMENT TRENDS
// ============================================
export const getWeeklyTrends = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role?.toLowerCase();
    
    // Define date range (last 7 days)
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d);
    }
    
    // Build query based on role
    const whereClause = userRole === 'doctor' 
      ? { doctorId: userId }
      : { patientId: userId };
    
    // Get appointments for each day
    const dailyData = await Promise.all(dates.map(async (date) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const appointments = await prisma.appointment.findMany({
        where: {
          ...whereClause,
          dateTime: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: { not: 'CANCELLED' }
        }
      });
      
      const completed = appointments.filter(a => a.status === 'COMPLETED').length;
      
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        appointments: appointments.length,
        completed: completed,
        cancelled: appointments.filter(a => a.status === 'CANCELLED').length
      };
    }));
    
    res.json(dailyData);
    
  } catch (error) {
    console.error('Error fetching weekly trends:', error);
    res.status(500).json({ error: 'Failed to fetch weekly trends' });
  }
};

// ============================================
// GET ALL PRESCRIPTIONS FOR A PATIENT
// ============================================
export const getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.userId;
    
    const prescriptions = await prisma.patientPrescription.findMany({
      where: { patientId: patientId },
      include: {
        doctor: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(prescriptions);
    
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
};

// ============================================
// GET ALL LAB REPORTS FOR A PATIENT
// ============================================
export const getPatientLabReports = async (req, res) => {
  try {
    const patientId = req.user.userId;
    
    const labReports = await prisma.patientLabReport.findMany({
      where: { patientId: patientId },
      include: {
        doctor: { select: { name: true, email: true } }
      },
      orderBy: { date: 'desc' }
    });
    
    res.json(labReports);
    
  } catch (error) {
    console.error('Error fetching lab reports:', error);
    res.status(500).json({ error: 'Failed to fetch lab reports' });
  }
};