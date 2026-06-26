import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ============================================
  // 1. CREATE ADMIN USER (YOU!)
  // ============================================
  // This creates the admin account that you'll use to manage the platform
  // The admin can approve/reject doctors, manage users, etc.
  console.log('👑 Creating admin user...');
  
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medicarehub.com' },
    update: {},
    create: {
      email: 'admin@medicarehub.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',           // ← This is the ADMIN role
      status: 'ACTIVE'          // Admin is always active
    }
  });
  console.log('✅ Admin created: admin@medicarehub.com / admin123');

  // ============================================
  // 2. CREATE TEST PATIENT
  // ============================================
  // This creates a test patient so you can test the patient experience
  console.log('👤 Creating test patient...');
  
  const patientPassword = await bcrypt.hash('password123', 10);
  const patient = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      password: patientPassword,
      name: 'John Patient',
      role: 'PATIENT',
      status: 'ACTIVE'
    }
  });
  console.log('✅ Patient created: patient@example.com / password123');

  // ============================================
  // 3. CREATE TEST DOCTOR (PENDING)
  // ============================================
  // This creates a test doctor that starts as PENDING
  // The admin needs to approve this doctor before they can practice
  console.log('👤 Creating test doctor...');
  
  const doctorPassword = await bcrypt.hash('password123', 10);
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@example.com' },
    update: {},
    create: {
      email: 'doctor@example.com',
      password: doctorPassword,
      name: 'Dr. Sarah Johnson',
      role: 'DOCTOR',
      status: 'PENDING',                    // ← PENDING = needs admin approval
      licenseNumber: 'MD-12345',
      specialization: 'Cardiologist',
      yearsExperience: 8
    }
  });
  console.log('✅ Doctor created: doctor@example.com / password123 (PENDING)');

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Seeding complete!');
  console.log('');
  console.log('🔑 Login Credentials:');
  console.log('  👑 Admin:   admin@medicarehub.com / admin123');
  console.log('  👤 Patient: patient@example.com / password123');
  console.log('  👤 Doctor:  doctor@example.com / password123 (PENDING)');
  console.log('');
  console.log('📌 Next Steps:');
  console.log('  1. Login as admin@medicarehub.com');
  console.log('  2. Go to Admin Panel');
  console.log('  3. Approve the pending doctor');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });