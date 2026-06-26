import { PrismaClient } from '@prisma/client';
import { sendNotification } from './notificationController.js';

const prisma = new PrismaClient();

// ============================================
// GET all appointments for the logged-in patient
// ============================================
export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.userId;
    
    const appointments = await prisma.appointment.findMany({
      where: { 
        patientId: patientId,
        status: { not: 'CANCELLED' }
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { dateTime: 'asc' }
    });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// ============================================
// GET all appointments for the logged-in doctor
// ============================================
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.userId;
    
    const appointments = await prisma.appointment.findMany({
      where: { 
        doctorId: doctorId,
        status: { not: 'CANCELLED' }
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { dateTime: 'asc' }
    });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ error: 'Failed to fetch doctor appointments' });
  }
};

// ============================================
// GET all doctors (for patient booking dropdown)
// ============================================
export const getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { 
        role: 'DOCTOR',
        status: 'ACTIVE'  // Only show verified doctors
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

// ============================================
// BOOK a new appointment (with double-booking prevention)
// ============================================
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, dateTime, reason } = req.body;
    const patientId = req.user.userId;
    const patientName = req.user.name;
    
    // Validate required fields
    if (!doctorId || !dateTime) {
      return res.status(400).json({ error: 'Doctor ID and date/time are required' });
    }
    
    // Convert to Date object
    const appointmentTime = new Date(dateTime);
    
    // Check if appointment is in the past
    if (appointmentTime < new Date()) {
      return res.status(400).json({ error: 'Cannot book appointments in the past' });
    }
    
    // Check if doctor exists and is actually a doctor
    const doctor = await prisma.user.findFirst({
      where: { 
        id: parseInt(doctorId),
        role: 'DOCTOR',
        status: 'ACTIVE'
      }
    });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found or not verified' });
    }
    
    // 🔒 DOUBLE-BOOKING PREVENTION:
    // Check if the doctor already has an appointment at this exact time
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: parseInt(doctorId),
        dateTime: appointmentTime,
        status: { not: 'CANCELLED' }
      }
    });
    
    if (existingAppointment) {
      return res.status(409).json({ 
        error: 'The doctor is already booked at this time. Please choose another slot.' 
      });
    }
    
    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientId,
        doctorId: parseInt(doctorId),
        dateTime: appointmentTime,
        reason: reason || null,
        status: 'PENDING'
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // ✅ SEND REAL-TIME NOTIFICATION TO DOCTOR
    try {
      await sendNotification(
        parseInt(doctorId),
        'APPOINTMENT_BOOKED',
        '📅 New Appointment Booked',
        `${patientName} booked an appointment with you on ${appointmentTime.toLocaleString()}`,
        { appointmentId: appointment.id, patientName: patientName }
      );
      console.log(`✅ Notification sent to doctor ${doctorId}`);
    } catch (error) {
      console.error('Error sending notification:', error);
      // Don't fail the booking if notification fails
    }
    
    res.status(201).json(appointment);
    
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
};

// ============================================
// CANCEL an appointment (soft delete - just updates status)
// ============================================
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: { select: { name: true } },
        doctor: { select: { id: true, name: true } }
      }
    });
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Check if the user is the patient or the doctor
    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }
    
    // Update status to CANCELLED
    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' }
    });
    
    // ✅ Send notification to the other party
    const otherPartyId = appointment.patientId === userId ? appointment.doctorId : appointment.patientId;
    const otherPartyName = appointment.patientId === userId ? appointment.doctor.name : appointment.patient.name;
    
    try {
      await sendNotification(
        otherPartyId,
        'APPOINTMENT_CANCELLED',
        '❌ Appointment Cancelled',
        `${req.user.name} cancelled the appointment with ${otherPartyName}`,
        { appointmentId: appointment.id }
      );
    } catch (error) {
      console.error('Error sending cancellation notification:', error);
    }
    
    res.json({ message: 'Appointment cancelled successfully', appointment: updatedAppointment });
    
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};

// ============================================
// UPDATE appointment status (for doctors)
// ============================================
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    
    // Valid statuses
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: { select: { name: true, id: true } },
        doctor: { select: { id: true, name: true } }
      }
    });
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Only the doctor can update status
    if (appointment.doctorId !== userId) {
      return res.status(403).json({ error: 'Only the doctor can update appointment status' });
    }
    
    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: status }
    });
    
    // ✅ Send notification to patient about status change
    try {
      const statusMessages = {
        'CONFIRMED': '✅ Your appointment has been confirmed',
        'COMPLETED': '✅ Your appointment has been completed',
        'CANCELLED': '❌ Your appointment has been cancelled by the doctor'
      };
      
      await sendNotification(
        appointment.patientId,
        `APPOINTMENT_${status}`,
        `📅 Appointment ${status.toLowerCase()}`,
        statusMessages[status] || `Your appointment status has been updated to ${status}`,
        { appointmentId: appointment.id }
      );
    } catch (error) {
      console.error('Error sending status notification:', error);
    }
    
    res.json({ message: 'Appointment status updated', appointment: updatedAppointment });
    
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};