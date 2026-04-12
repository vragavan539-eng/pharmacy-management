require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Drug     = require('./models/Drug');
const Patient  = require('./models/Patient');

const DRUGS = [
  { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'analgesic', dosageForm: 'tablet', strength: '500mg', quantity: 500, minStockLevel: 50, unitPrice: 1.5, sellingPrice: 2, requiresPrescription: false, manufacturer: 'Cipla', expiryDate: new Date('2026-12-31') },
  { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'antibiotic', dosageForm: 'capsule', strength: '500mg', quantity: 8, minStockLevel: 30, unitPrice: 8, sellingPrice: 12, requiresPrescription: true, manufacturer: 'Sun Pharma', expiryDate: new Date('2025-06-30') },
  { name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'antidiabetic', dosageForm: 'tablet', strength: '500mg', quantity: 200, minStockLevel: 40, unitPrice: 3, sellingPrice: 5, requiresPrescription: true, manufacturer: 'Lupin', expiryDate: new Date('2026-09-30') },
  { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', category: 'cardiovascular', dosageForm: 'tablet', strength: '10mg', quantity: 5, minStockLevel: 20, unitPrice: 6, sellingPrice: 10, requiresPrescription: true, manufacturer: 'Pfizer', expiryDate: new Date('2024-01-01') },
  { name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', category: 'antihistamine', dosageForm: 'tablet', strength: '10mg', quantity: 150, minStockLevel: 30, unitPrice: 2, sellingPrice: 4, requiresPrescription: false, manufacturer: 'GSK', expiryDate: new Date('2026-03-31') },
  { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'antacid', dosageForm: 'capsule', strength: '20mg', quantity: 180, minStockLevel: 30, unitPrice: 4, sellingPrice: 7, requiresPrescription: false, manufacturer: 'AstraZeneca', expiryDate: new Date('2026-08-31') },
  { name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'antibiotic', dosageForm: 'tablet', strength: '500mg', quantity: 60, minStockLevel: 20, unitPrice: 15, sellingPrice: 22, requiresPrescription: true, manufacturer: 'Cipla', expiryDate: new Date('2026-11-30') },
  { name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'antihypertensive', dosageForm: 'tablet', strength: '5mg', quantity: 12, minStockLevel: 25, unitPrice: 3.5, sellingPrice: 6, requiresPrescription: true, manufacturer: 'Pfizer', expiryDate: new Date('2026-07-31') },
  { name: 'Vitamin D3 60000IU', genericName: 'Cholecalciferol', category: 'vitamin', dosageForm: 'capsule', strength: '60000IU', quantity: 300, minStockLevel: 50, unitPrice: 20, sellingPrice: 35, requiresPrescription: false, manufacturer: 'Abbott', expiryDate: new Date('2026-12-31') },
  { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', category: 'antacid', dosageForm: 'tablet', strength: '40mg', quantity: 220, minStockLevel: 30, unitPrice: 5, sellingPrice: 8, requiresPrescription: false, manufacturer: 'Alkem', expiryDate: new Date('2026-10-31') },
];

const PATIENTS = [
  { firstName: 'Ramesh', lastName: 'Kumar', phone: '9876543210', email: 'ramesh@email.com', gender: 'male', dateOfBirth: new Date('1975-05-15'), allergies: ['Penicillin'], chronicConditions: ['Diabetes', 'Hypertension'], bloodGroup: 'B+' },
  { firstName: 'Priya', lastName: 'Sharma', phone: '9876543211', email: 'priya@email.com', gender: 'female', dateOfBirth: new Date('1985-08-22'), allergies: [], chronicConditions: ['Asthma'], bloodGroup: 'A+' },
  { firstName: 'Suresh', lastName: 'Patel', phone: '9876543212', gender: 'male', dateOfBirth: new Date('1960-12-01'), allergies: ['Sulfa'], chronicConditions: ['Hypertension', 'Heart Disease'], bloodGroup: 'O+' },
  { firstName: 'Kavitha', lastName: 'Nair', phone: '9876543213', email: 'kavitha@email.com', gender: 'female', dateOfBirth: new Date('1992-03-10'), allergies: [], chronicConditions: [], bloodGroup: 'AB+' },
  { firstName: 'Arun', lastName: 'Krishnan', phone: '9876543214', gender: 'male', dateOfBirth: new Date('1955-11-28'), allergies: ['Aspirin'], chronicConditions: ['Diabetes', 'Kidney Disease'], bloodGroup: 'B-' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy_ai');
    console.log('✅ Connected to MongoDB');

    // Admin user
    const exists = await User.findOne({ email: 'admin@pharmacy.com' });
    if (!exists) {
      await User.create({ name: 'Admin', email: 'admin@pharmacy.com', password: 'password', role: 'admin' });
      console.log('✅ Admin user created — admin@pharmacy.com / password');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Drugs
    const drugCount = await Drug.countDocuments();
    if (drugCount === 0) {
      await Drug.insertMany(DRUGS);
      console.log(`✅ ${DRUGS.length} sample drugs added`);
    } else {
      console.log(`ℹ️  ${drugCount} drugs already exist`);
    }

    // Patients
    const patientCount = await Patient.countDocuments();
    if (patientCount === 0) {
      for (const p of PATIENTS) { await Patient.create(p); }
      console.log(`✅ ${PATIENTS.length} sample patients added`);
    } else {
      console.log(`ℹ️  ${patientCount} patients already exist`);
    }

    console.log('\n🎉 Seed complete! Login with admin@pharmacy.com / password\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
