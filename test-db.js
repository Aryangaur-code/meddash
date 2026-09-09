const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const DoctorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  degree: { type: String },
  specialization: { type: String },
  experience: { type: String },
  postingHospital: { type: String },
  profileText: { type: String },
  age: { type: Number },
}, { timestamps: true });
const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);

const PatientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  mrn: { type: String },
  residence: { type: String },
  vitals: {
    bp: String,
    hr: Number,
    spo2: Number,
    temp: Number
  },
  chronicConditions: [String],
  medications: [String],
  allergies: [String],
  recentVisits: [mongoose.Schema.Types.Mixed],
  reports: [mongoose.Schema.Types.Mixed],
  aiCases: [mongoose.Schema.Types.Mixed]
}, { timestamps: true });
const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

async function run() {
  console.log('Connecting to', process.env.MONGODB_URI ? 'URI exists' : 'NO URI');
  await mongoose.connect(process.env.MONGODB_URI);
  
  try {
    const newDoc = new Doctor({
      id: `DOC-TEST-${Date.now()}`,
      name: 'Dr. Test',
      degree: 'MBBS',
      specialization: 'General Medicine',
      experience: '5+ Years',
      postingHospital: 'Private Clinic',
      profileText: 'Test profile',
      age: 35
    });
    await newDoc.save();
    console.log('Doctor saved successfully!');
  } catch (e) {
    console.error('Doctor Error:', e.message);
  }

  try {
    const newPat = new Patient({
      id: `PAT-TEST-${Date.now()}`,
      name: 'Patient Test',
      age: 30,
      gender: 'Male',
      mrn: 'MRN-TEST',
      residence: 'Unknown',
      vitals: { bp: '120/80', hr: 72, spo2: 98, temp: 98.6 },
      chronicConditions: [],
      medications: [],
      allergies: [],
    });
    await newPat.save();
    console.log('Patient saved successfully!');
  } catch (e) {
    console.error('Patient Error:', e.message);
  }
  
  process.exit(0);
}

run();
