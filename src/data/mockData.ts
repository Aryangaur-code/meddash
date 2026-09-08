// mockData.ts

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  mrn: string; // Medical Record Number
  regionOfBirth?: string;
  residence?: string;
  vitals: {
    bp: string;
    hr: number;
    spo2: number;
    temp: number;
    bmi?: number;
  };
  lastBloodReport?: string;
  lastBodyCheckup?: string;
  chronicConditions: string[];
  medications: string[];
  allergies: string[];
  dailyActivities?: string;
  environmentalExposures?: string;
  recentVisits: Array<{ date: string; diagnosis: string }>;
  reports?: Array<{id: string, name: string, date: string, size: string, type: string}>;
};

export const patients: Patient[] = [
  {
    id: 'P-1001',
    name: 'Rajesh Kumar',
    age: 58,
    gender: 'Male',
    mrn: 'MRN-847291',
    regionOfBirth: 'Rajasthan, India',
    residence: 'Jaipur, Rajasthan',
    vitals: { bp: '145/90', hr: 82, spo2: 97, temp: 98.6, bmi: 28.4 },
    lastBloodReport: '2026-05-10',
    lastBodyCheckup: '2025-11-20',
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    medications: ['Metformin 500mg', 'Amlodipine 5mg'],
    allergies: ['Penicillin'],
    dailyActivities: 'Sedentary office job, minimal exercise (20 mins walk/week)',
    environmentalExposures: 'Air pollution (urban area), prolonged screen time',
    recentVisits: [
      { date: '2026-05-15', diagnosis: 'Routine Checkup' },
      { date: '2026-02-10', diagnosis: 'Hypertension Management' }
    ],
    reports: [
      { id: 'REP-101', name: 'HbA1c_May_2026.pdf', date: '2026-05-11', size: '240 KB', type: 'application/pdf' },
      { id: 'REP-102', name: 'Lipid_Panel_May.pdf', date: '2026-05-11', size: '315 KB', type: 'application/pdf' }
    ]
  },
  {
    id: 'P-1002',
    name: 'Anita Sharma',
    age: 42,
    gender: 'Female',
    mrn: 'MRN-392011',
    regionOfBirth: 'Delhi, India',
    residence: 'Jodhpur, Rajasthan',
    vitals: { bp: '118/76', hr: 70, spo2: 99, temp: 98.4, bmi: 24.1 },
    lastBloodReport: '2026-04-18',
    lastBodyCheckup: '2026-01-05',
    chronicConditions: ['Asthma'],
    medications: ['Salbutamol Inhaler'],
    allergies: ['Dust Mites', 'Pollen'],
    dailyActivities: 'Moderate activity, yoga 3x/week',
    environmentalExposures: 'Dusty environment during commute, occasional secondhand smoke',
    recentVisits: [
      { date: '2026-04-22', diagnosis: 'Asthma Exacerbation' }
    ],
    reports: [
      { id: 'REP-201', name: 'Spirometry_Results.pdf', date: '2026-04-20', size: '512 KB', type: 'application/pdf' }
    ]
  },
  {
    id: 'P-1003',
    name: 'Vikram Singh',
    age: 65,
    gender: 'Male',
    mrn: 'MRN-559302',
    regionOfBirth: 'Punjab, India',
    residence: 'Udaipur, Rajasthan',
    vitals: { bp: '130/85', hr: 75, spo2: 96, temp: 98.8, bmi: 31.2 },
    lastBloodReport: '2026-05-25',
    lastBodyCheckup: '2024-09-12',
    chronicConditions: ['Osteoarthritis'],
    medications: ['Ibuprofen 400mg PRN'],
    allergies: ['None'],
    dailyActivities: 'Retired, mostly sedentary, limited mobility due to knee pain',
    environmentalExposures: 'None significant',
    recentVisits: [
      { date: '2026-06-01', diagnosis: 'Knee Pain Evaluation' }
    ],
    reports: [
      { id: 'REP-301', name: 'Knee_XRay_Right.pdf', date: '2026-05-28', size: '1.2 MB', type: 'application/pdf' }
    ]
  }
];

export const currentConsultation = {
  patient: patients[0],
  transcript: [
    { speaker: 'Dr. Sharma', text: "Hello Rajesh. How have your blood sugar levels been lately?", time: "10:02 AM" },
    { speaker: 'Rajesh', text: "They've been okay, doctor. Fasting is usually around 130. But my blood pressure was high at home, around 150 over 95.", time: "10:03 AM" },
    { speaker: 'Dr. Sharma', text: "I see. Yes, your reading today is 145/90. We might need to adjust your Amlodipine. Are you having any headaches or dizziness?", time: "10:04 AM" },
    { speaker: 'Rajesh', text: "Occasional mild headaches in the evening. No dizziness.", time: "10:04 AM" }
  ],
  aiSummary: {
    subjective: "Patient reports fasting blood sugars around 130 mg/dL. Reports home BP readings of 150/95 mmHg. Complains of occasional mild evening headaches. Denies dizziness.",
    objective: "In-clinic BP: 145/90 mmHg. HR: 82 bpm. SpO2: 97%. Temp: 98.6F.",
    assessment: "1. Essential (primary) hypertension, poorly controlled.\n2. Type 2 diabetes mellitus, adequately controlled on current regimen.",
    plan: "1. Increase Amlodipine from 5mg to 10mg daily.\n2. Continue Metformin 500mg daily.\n3. Monitor home BP for 2 weeks.\n4. Return to clinic in 1 month."
  },
  extractedCodes: [
    { code: 'I10', desc: 'Essential (primary) hypertension', confidence: 0.96 },
    { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications', confidence: 0.94 }
  ],
  graphRelationships: [
    { source: { label: 'Headaches (Evening)', type: 'symptom' }, target: { label: 'Hypertension', type: 'disease' }, predicate: 'associated_with', confidence: 0.89 },
    { source: { label: 'BP 145/90', type: 'lab' }, target: { label: 'Hypertension', type: 'disease' }, predicate: 'indicates', confidence: 0.95 },
    { source: { label: 'Fasting Glucose 130', type: 'lab' }, target: { label: 'Type 2 Diabetes', type: 'disease' }, predicate: 'indicates', confidence: 0.92 }
  ],
  graphSummary: "Graph analysis indicates the evening headaches are strongly correlated with the elevated BP readings (145/90), reinforcing the diagnosis of poorly controlled Hypertension. The fasting glucose of 130 is consistent with stable Type 2 Diabetes."
};

export const claims = [
  { id: 'CLM-9921', patient: 'Rajesh Kumar', date: '2026-06-09', status: 'Pending', codes: ['I10', 'E11.9', '99213'], amount: 1500 },
  { id: 'CLM-9920', patient: 'Anita Sharma', date: '2026-06-08', status: 'Approved', codes: ['J45.909', '99213'], amount: 1200 },
  { id: 'CLM-9919', patient: 'Vikram Singh', date: '2026-06-08', status: 'Under AI Audit', codes: ['M19.90', '99214'], amount: 1800 },
  { id: 'CLM-9918', patient: 'Priya Patel', date: '2026-06-05', status: 'Rejected', codes: ['R07.9', '99283'], amount: 3500 }
];

export const dashboardAnalytics = {
  totalPatientsToday: 24,
  aiTimeSaved: '2.5 hrs',
  claimAcceptanceRate: '94%',
  upcomingAppointments: [
    { time: '10:30 AM', patient: 'Rajesh Kumar', type: 'Follow-up' },
    { time: '11:00 AM', patient: 'Vikram Singh', type: 'Consultation' },
    { time: '11:30 AM', patient: 'Neha Gupta', type: 'Routine Checkup' },
    { time: '12:00 PM', patient: 'Rahul Verma', type: 'Follow-up' },
  ],
  recentAlerts: [
    { type: 'Critical', message: 'Abnormal Lab Result: Potassium 6.2 mEq/L (R. Verma)' },
    { type: 'Warning', message: 'Drug Interaction Detected: Clopidogrel + Omeprazole' },
    { type: 'Info', message: '3 Claims require manual review' }
  ]
};

export const doctorProfile = {
  name: 'Dr. Rohan Sharma',
  age: 45,
  degree: 'MBBS, MD (Internal Medicine), FACP',
  profileText: 'Senior Consultant Physician with over 15 years of experience specializing in complex chronic diseases, diabetes management, and preventive cardiology. Passionate about integrating AI and technology into clinical workflows to improve patient outcomes.',
  experience: '15+ Years',
  socialLinks: {
    linkedin: 'linkedin.com/in/dr-rohan-sharma',
    twitter: '@DrRohanMedicine',
    researchGate: 'researchgate.net/profile/Rohan-Sharma'
  },
  postingHospital: 'City General Hospital, New Delhi',
  trackRecord: {
    totalPatients: 15420,
    successfulDiagnoses: '99.2%',
    publications: 24,
    awards: ['Best Physician 2024', 'Excellence in Medical Research']
  },
  hospitalsInContact: [
    'Apollo Spectra, South Delhi',
    'Max Super Speciality, Saket',
    'Fortis Escorts Heart Institute'
  ]
};

export const prescriptions = [
  { id: 'RX-101', patient: 'Rajesh Kumar', drug: 'Amlodipine', dose: '10mg', frequency: 'OD', duration: '30 days', status: 'Draft' },
  { id: 'RX-102', patient: 'Rajesh Kumar', drug: 'Metformin', dose: '500mg', frequency: 'BD', duration: '30 days', status: 'Active' },
  { id: 'RX-103', patient: 'Anita Sharma', drug: 'Salbutamol Inhaler', dose: '100mcg/actuation', frequency: 'PRN', duration: 'N/A', status: 'Active' }
];

export type Pharmacy = {
  id: string;
  name: string;
  contact: string;
  address: string;
  area: string;
  hours: string;
  delivery: string;
  rating: number;
  isOpen: boolean;
};

export const mockPharmacies: Pharmacy[] = [
  // Jhotwara
  { id: 'PH-J1', name: 'Dawaa Dost - Jhotwara', contact: 'Not listed', address: 'Shriniwas Complex, Kalwar Rd, Near Panchayat Samiti', area: 'Jhotwara', hours: '7 AM–10:30 PM', delivery: 'Yes', rating: 5.0, isOpen: true },
  { id: 'PH-J2', name: 'Apollo Pharmacy Jhotwara Road', contact: '+91 98291 98106', address: 'Kalwar Rd, Opp Eyeworld Optics, Suraj Nagar', area: 'Jhotwara', hours: '7 AM–11 PM', delivery: 'Yes', rating: 4.5, isOpen: true },
  { id: 'PH-J3', name: 'Zeelab Pharmacy - Jhotwara', contact: '+91 98962 77732', address: 'Sangh Shakti Rd, Near Kanta Chouraha', area: 'Jhotwara', hours: '7 AM–11 PM', delivery: 'Limited', rating: 4.7, isOpen: true },
  { id: 'PH-J4', name: 'Apollo Pharmacy Khirni Phatak', contact: '+91 97733 22510', address: 'Hanuman Rd, Ridhi Sidhi Nagar', area: 'Jhotwara', hours: '7 AM–11 PM', delivery: 'Yes', rating: 4.3, isOpen: true },
  { id: 'PH-J5', name: 'Apollo Pharmacy Niwaru Road', contact: '+91 79428 14484', address: 'Niwaru Rd, Laxmi Nagar', area: 'Jhotwara', hours: '7 AM–11 PM', delivery: 'Yes', rating: 4.4, isOpen: true },
  
  // Vaishali Nagar
  { id: 'PH-V1', name: 'Medkart Pharmacy - Vaishali Nagar', contact: '+91 72309 64964', address: 'Vaishali Tower, Nursery Circle', area: 'Vaishali Nagar', hours: '9 AM–11 PM', delivery: 'Yes', rating: 4.6, isOpen: true },
  { id: 'PH-V2', name: 'Dawaa Dost - Vaishali Nagar', contact: '+91 83060 05150', address: 'Queens Road, Vidhyut Nagar', area: 'Vaishali Nagar', hours: '24 Hours', delivery: 'Yes', rating: 4.8, isOpen: true },
  { id: 'PH-V3', name: 'Shree Ram Pharmacy', contact: '+91 89059 53504', address: 'Gandhi Path Road, Amrapali West', area: 'Vaishali Nagar', hours: 'Mostly 24 Hours', delivery: 'Yes', rating: 4.5, isOpen: true },
  { id: 'PH-V4', name: 'Pacific Pharmacy', contact: '+91 98292 03386', address: 'Chitrakoot Scheme, Vaishali Nagar', area: 'Vaishali Nagar', hours: '7 AM–11 PM', delivery: 'Yes', rating: 4.2, isOpen: true },
  { id: 'PH-V5', name: 'Apollo Pharmacy Gandhi Path', contact: '+91 97733 81739', address: 'Gandhi Path Road, Vaishali Nagar', area: 'Vaishali Nagar', hours: '7 AM–11 PM', delivery: 'Yes', rating: 4.4, isOpen: true },

  // Mansarovar
  { id: 'PH-M1', name: 'Apollo Pharmacy Madhyam Marg', contact: '+91 79474 79609', address: 'Madhyam Marg, Sector 6', area: 'Mansarovar', hours: '7 AM–11 PM', delivery: 'Yes', rating: 4.5, isOpen: true },
  { id: 'PH-M2', name: 'Apollo Pharmacy Shipra Path', contact: '+91 79474 79447', address: 'Rajat Path, Sector 3', area: 'Mansarovar', hours: '7 AM–11 PM', delivery: 'Yes', rating: 4.3, isOpen: true },
  { id: 'PH-M3', name: 'Apollo Pharmacy Mansarovar Vijaypath', contact: '+91 80038 99476', address: 'Vijay Path Circle', area: 'Mansarovar', hours: '7 AM–11 PM', delivery: 'Yes', rating: 4.4, isOpen: true },
  { id: 'PH-M4', name: 'Dawaa Dost - Mansarovar', contact: 'Store Contact', address: 'Madhyam Marg, Sector 7, Agarwal Farm', area: 'Mansarovar', hours: '7 AM–10 PM', delivery: 'Yes', rating: 4.7, isOpen: true },
  { id: 'PH-M5', name: 'Apollo Pharmacy Rajat Path', contact: '+91 79474 79611', address: 'Rajat Path, Sector 4', area: 'Mansarovar', hours: '7 AM–11 PM', delivery: 'Yes', rating: 4.2, isOpen: true },

  // Malviya Nagar
  { id: 'PH-MN1', name: 'Apollo Pharmacy Malviya Nagar', contact: '+91 79492 86401', address: 'Girdhar Marg, Sector 12', area: 'Malviya Nagar', hours: '24 Hours', delivery: 'Yes', rating: 4.6, isOpen: true },
  { id: 'PH-MN2', name: 'Monu Pharmacy', contact: '+91 98288 67203', address: 'Girdhar Marg Bypass, Malviya Nagar', area: 'Malviya Nagar', hours: '24 Hours', delivery: 'Yes', rating: 4.8, isOpen: true },
  { id: 'PH-MN3', name: 'davaindia GENERIC PHARMACY', contact: '+91 96807 57462', address: 'Sector 13, Malviya Nagar', area: 'Malviya Nagar', hours: '8 AM–11 PM', delivery: 'Yes', rating: 4.3, isOpen: true },
  { id: 'PH-MN4', name: 'M2 Pharmacy', contact: '+91 85292 67174', address: 'Siddharth Nagar, Malviya Nagar', area: 'Malviya Nagar', hours: '8 AM–10 PM', delivery: 'Limited', rating: 4.1, isOpen: true },
  { id: 'PH-MN5', name: 'Apollo Pharmacy Malviya Nagar Sec 2', contact: '+91 79474 79610', address: 'Sector 2, Malviya Nagar', area: 'Malviya Nagar', hours: '7 AM–11 PM', delivery: 'Yes', rating: 4.4, isOpen: true },
];

export type Medicine = {
  id: string;
  name: string;
  diseaseCategory: string;
  price: number;
  stock: number;
  description: string;
  gstRate: number;
};

export const mockMedicines: Medicine[] = [
  // Type 2 Diabetes
  { id: 'MED-1', name: 'Metformin 500mg', diseaseCategory: 'Type 2 Diabetes', price: 45, stock: 120, description: 'Standard oral diabetes medicine.', gstRate: 5 },
  { id: 'MED-2', name: 'Glimepiride 2mg', diseaseCategory: 'Type 2 Diabetes', price: 65, stock: 80, description: 'Helps control blood sugar levels.', gstRate: 5 },
  { id: 'MED-3', name: 'Sitagliptin 100mg', diseaseCategory: 'Type 2 Diabetes', price: 210, stock: 50, description: 'DPP-4 inhibitor for adults with type 2 diabetes.', gstRate: 5 },
  
  // Asthma
  { id: 'MED-4', name: 'Salbutamol Inhaler (100mcg)', diseaseCategory: 'Asthma', price: 150, stock: 45, description: 'Reliever inhaler for sudden breathing problems.', gstRate: 5 },
  { id: 'MED-5', name: 'Budesonide Inhaler (200mcg)', diseaseCategory: 'Asthma', price: 320, stock: 30, description: 'Preventer inhaler to reduce inflammation.', gstRate: 5 },
  { id: 'MED-6', name: 'Montelukast 10mg', diseaseCategory: 'Asthma', price: 110, stock: 60, description: 'Daily pill for asthma prevention.', gstRate: 5 },

  // Hypertension
  { id: 'MED-7', name: 'Amlodipine 5mg', diseaseCategory: 'Hypertension', price: 35, stock: 150, description: 'Calcium channel blocker to lower blood pressure.', gstRate: 5 },
  { id: 'MED-8', name: 'Losartan 50mg', diseaseCategory: 'Hypertension', price: 55, stock: 90, description: 'Keeps blood vessels from narrowing.', gstRate: 5 },
  { id: 'MED-9', name: 'Telmisartan 40mg', diseaseCategory: 'Hypertension', price: 85, stock: 75, description: 'Angiotensin II receptor blocker.', gstRate: 5 },

  // General / Viral
  { id: 'MED-10', name: 'Paracetamol 650mg', diseaseCategory: 'General / Fever', price: 20, stock: 500, description: 'Fever and pain reliever.', gstRate: 5 },
  { id: 'MED-11', name: 'Azithromycin 500mg', diseaseCategory: 'General / Fever', price: 120, stock: 100, description: 'Antibiotic for bacterial infections.', gstRate: 5 },
  { id: 'MED-12', name: 'Vitamin C + Zinc', diseaseCategory: 'General / Fever', price: 60, stock: 200, description: 'Immunity boosting dietary supplement.', gstRate: 18 },
  
  // Critical / Life-Saving (Example for 0%)
  { id: 'MED-13', name: 'Human Blood Plasma', diseaseCategory: 'General / Fever', price: 1500, stock: 5, description: 'Critical life-saving blood component.', gstRate: 0 },
  
  // Ayurvedic / Specialized (Example for 12%)
  { id: 'MED-14', name: 'Ayurvedic Cough Syrup', diseaseCategory: 'General / Fever', price: 95, stock: 40, description: 'Specialized alternative medicine.', gstRate: 12 }
];

export const wearableVitals = [
  { day: 'Mon', heartRate: 72, steps: 6500, sleep: 6.5, calories: 2100 },
  { day: 'Tue', heartRate: 75, steps: 8200, sleep: 7.2, calories: 2400 },
  { day: 'Wed', heartRate: 71, steps: 5400, sleep: 5.8, calories: 1900 },
  { day: 'Thu', heartRate: 74, steps: 9100, sleep: 7.5, calories: 2600 },
  { day: 'Fri', heartRate: 78, steps: 7300, sleep: 6.8, calories: 2300 },
  { day: 'Sat', heartRate: 69, steps: 11000, sleep: 8.1, calories: 2900 },
  { day: 'Sun', heartRate: 70, steps: 4200, sleep: 7.9, calories: 1700 },
];

export const patientSupplyStatus = [
  { medName: 'Metformin 500mg', totalPills: 30, pillsLeft: 4, refillDate: '2026-07-22' },
  { medName: 'Amlodipine 5mg', totalPills: 30, pillsLeft: 18, refillDate: '2026-08-05' },
];
