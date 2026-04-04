/**
 * Seed script - creates demo users for testing all 3 roles.
 * Run with: npm run seed
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User.model');
const Job = require('./models/Job.model');
const ActivityLog = require('./models/ActivityLog.model');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Job.deleteMany({});
  await ActivityLog.deleteMany({});
  console.log('🗑️  Cleared existing data');

  const salt = await bcrypt.genSalt(12);
  const hash = (pwd) => bcrypt.hash(pwd, salt);

  // Create demo users
  const [admin, tech1, tech2, techPending, client1, client2] = await User.insertMany([
    { name: 'Admin User', email: 'admin@fieldops.com', password: await hash('admin123'), role: 'ADMIN' },
    { name: 'John Technician', email: 'john@fieldops.com', password: await hash('john123'), role: 'TECHNICIAN', isActive: true },
    { name: 'Sara Technician', email: 'sara@fieldops.com', password: await hash('sara123'), role: 'TECHNICIAN', isActive: true },
    { name: 'Areeb Technician', email: 'areeb@fieldops.com', password: await hash('areeb123'), role: 'TECHNICIAN', isActive: false },
    { name: 'Acme Corp', email: 'acme@client.com', password: await hash('acme123'), role: 'CLIENT', isActive: true },
    { name: 'Beta Industries', email: 'beta@client.com', password: await hash('beta123'), role: 'CLIENT', isActive: true },
  ]);

  console.log('👥 Created 6 demo users (including 1 pending tech)');

  // Create demo jobs
  const job1 = await Job.create({
    title: 'HVAC System Repair',
    description: 'AC unit in main office is non-functional. Needs immediate inspection and repair.',
    status: 'IN_PROGRESS',
    client: client1._id,
    technician: tech1._id,
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    location: '123 Business Park, Floor 3',
    priority: 'HIGH',
  });

  const job2 = await Job.create({
    title: 'Electrical Installation',
    description: 'Install new power outlets in the warehouse expansion area.',
    status: 'ASSIGNED',
    client: client2._id,
    technician: tech2._id,
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: 'Warehouse B, Section 4',
    priority: 'MEDIUM',
  });

  const job3 = await Job.create({
    title: 'Security Camera Inspection',
    description: 'Annual inspection of all CCTV cameras. Check footage integrity and replace any faulty units.',
    status: 'PENDING',
    client: client1._id,
    location: 'All floors, Main Building',
    priority: 'LOW',
  });

  const job4 = await Job.create({
    title: 'Plumbing Emergency',
    description: 'Major pipe burst in basement causing flooding. Emergency response needed.',
    status: 'COMPLETED',
    client: client2._id,
    technician: tech1._id,
    priority: 'URGENT',
  });

  console.log('💼 Created 4 demo jobs');

  // Seed some activity logs
  await ActivityLog.insertMany([
    { job: job1._id, actor: admin._id, message: 'Job "HVAC System Repair" created.', type: 'CREATION' },
    { job: job1._id, actor: admin._id, message: `Job assigned to ${tech1.name}.`, type: 'ASSIGNMENT' },
    { job: job1._id, actor: tech1._id, message: 'Status changed from ASSIGNED to IN_PROGRESS.', type: 'STATUS_CHANGE', previousStatus: 'ASSIGNED', newStatus: 'IN_PROGRESS' },
    { job: job1._id, actor: tech1._id, message: 'Diagnosed compressor failure. Need replacement part.', type: 'NOTE' },
    { job: job4._id, actor: admin._id, message: 'Job "Plumbing Emergency" created.', type: 'CREATION' },
    { job: job4._id, actor: tech1._id, message: 'Pipe repaired and water damage cleaned. Job complete.', type: 'NOTE' },
    { job: job4._id, actor: tech1._id, message: 'Status changed from IN_PROGRESS to COMPLETED.', type: 'STATUS_CHANGE', previousStatus: 'IN_PROGRESS', newStatus: 'COMPLETED' },
  ]);

  console.log('📋 Created activity logs');

  console.log('\n🎉 Seed complete! Login credentials:');
  console.log('  Admin:      admin@fieldops.com / admin123');
  console.log('  Tech 1:     john@fieldops.com  / john123');
  console.log('  Tech 2:     sara@fieldops.com  / sara123');
  console.log('  Client 1:   acme@client.com    / acme123');
  console.log('  Client 2:   beta@client.com    / beta123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
