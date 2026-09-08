'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { patients as mockPatients, doctorProfile, claims as mockClaims, prescriptions as mockPrescriptions, dashboardAnalytics } from '@/data/mockData';

type Role = 'none' | 'doctor' | 'patient' | 'pharmacy';

interface AppState {
  role: Role;
  doctorProfile: any;
  doctorsList: any[];
  patients: any[];
  claims: any[];
  prescriptions: any[];
  analytics: any;
  setRole: (role: Role) => void;
  updateDoctorProfile: (profile: any) => void;
  addPatient: (patient: any) => void;
  updateClaimStatus: (id: string, status: string) => void;
  bookAppointment: (appointment: any) => void;
  uploadReport: (patientId: string, report: any) => void;
  addMedication: (patientId: string, medication: string) => void;
  addAiCase: (patientId: string, aiCaseData: any) => void;
}

const defaultState: AppState = {
  role: 'none',
  doctorProfile: null,
  doctorsList: [],
  patients: [],
  claims: [],
  prescriptions: [],
  analytics: null,
  setRole: () => {},
  updateDoctorProfile: () => {},
  addPatient: () => {},
  updateClaimStatus: () => {},
  bookAppointment: () => {},
  uploadReport: () => {},
  addMedication: () => {},
  addAiCase: () => {},
};

const AppContext = createContext<AppState>(defaultState);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<Role>('none');
  const [docProfile, setDocProfile] = useState<any>(doctorProfile);
  const [patients, setPatients] = useState<any[]>(mockPatients);
  const [claims, setClaims] = useState<any[]>(mockClaims);
  const [prescriptions, setPrescriptions] = useState<any[]>(mockPrescriptions);
  const [analytics, setAnalytics] = useState<any>(dashboardAnalytics);
  
  // List of doctors for patients to choose from (Rajasthan Region Focus)
  const [doctorsList, setDoctorsList] = useState<any[]>([
    { ...doctorProfile, id: 'DOC-1', city: 'Jaipur', specialization: 'Internal Medicine', symptoms: ['diabetes', 'fever', 'blood pressure'], rating: 4.8, reviews: 124, fee: 800, lat: 26.9124, lng: 75.7873 },
    { name: 'Dr. Anita Desai', id: 'DOC-2', city: 'Jodhpur', specialization: 'Cardiology', degree: 'MD, DM', postingHospital: 'AIIMS Jodhpur', symptoms: ['chest pain', 'heart', 'blood pressure'], rating: 4.9, reviews: 312, fee: 1200, trackRecord: { successfulDiagnoses: '98%' } },
    { name: 'Dr. Vikram Seth', id: 'DOC-3', city: 'Jaipur', specialization: 'Orthopedics', degree: 'MS Ortho', postingHospital: 'SMS Hospital Jaipur', symptoms: ['bone', 'joint pain', 'fracture'], rating: 4.6, reviews: 89, fee: 600, trackRecord: { successfulDiagnoses: '97.5%' } },
    { name: 'Dr. Meera Rajput', id: 'DOC-4', city: 'Udaipur', specialization: 'Neurology', degree: 'MD, DM Neuro', postingHospital: 'Geetanjali Medicity Udaipur', symptoms: ['headache', 'migraine', 'dizziness'], rating: 4.7, reviews: 156, fee: 1000, trackRecord: { successfulDiagnoses: '96%' } },
    { name: 'Dr. Sanjay Singh', id: 'DOC-5', city: 'Kota', specialization: 'Pediatrics', degree: 'MD Pediatrics', postingHospital: 'Kota Heart Hospital', symptoms: ['fever', 'cough', 'child'], rating: 4.5, reviews: 210, fee: 500, trackRecord: { successfulDiagnoses: '99%' } }
  ]);

  // Load from database on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('meddash_role');
    if (savedRole) setRoleState(savedRole as Role);

    // Fetch from MongoDB
    fetch('/api/doctor')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setDocProfile(data);
      })
      .catch(console.error);

    fetch('/api/patients')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setPatients(data);
      })
      .catch(console.error);

    const savedClaims = localStorage.getItem('meddash_claims');
    if (savedClaims) setClaims(JSON.parse(savedClaims));
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem('meddash_role', newRole);
  };

  const updateDoctorProfile = async (profile: any) => {
    setDocProfile(profile);
    setDoctorsList(prev => prev.map(d => d.id === 'DOC-1' ? { ...d, ...profile } : d));
    
    try {
      await fetch('/api/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch (e) {
      console.error('Failed to update doctor in DB', e);
    }
  };

  const addPatient = async (patient: any) => {
    setPatients(prev => [...prev, patient]);
    try {
      await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient)
      });
    } catch (e) {
      console.error('Failed to add patient to DB', e);
    }
  };

  const updateClaimStatus = (id: string, status: string) => {
    const newClaims = claims.map(c => c.id === id ? { ...c, status } : c);
    setClaims(newClaims);
    localStorage.setItem('meddash_claims', JSON.stringify(newClaims));
  };

  const bookAppointment = (appointment: any) => {
    const newAnalytics = {
      ...analytics,
      upcomingAppointments: [...analytics.upcomingAppointments, appointment]
    };
    setAnalytics(newAnalytics);
  };

  const uploadReport = async (patientId: string, report: any) => {
    const targetPatient = patients.find(p => p.id === patientId);
    if (!targetPatient) return;
    
    const updatedReports = [...(targetPatient.reports || []), report];
    
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, reports: updatedReports } : p));
    
    try {
      await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports: updatedReports })
      });
    } catch (e) {
      console.error('Failed to update patient report in DB', e);
    }
  };

  const addMedication = async (patientId: string, medication: string) => {
    const targetPatient = patients.find(p => p.id === patientId);
    if (!targetPatient) return;
    
    const updatedMeds = [...(targetPatient.medications || []), medication];
    
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, medications: updatedMeds } : p));
    
    try {
      await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications: updatedMeds })
      });
    } catch (e) {
      console.error('Failed to add medication in DB', e);
    }
  };

  const addAiCase = async (patientId: string, aiCaseData: any) => {
    const targetPatient = patients.find(p => p.id === patientId);
    if (!targetPatient) return;
    
    const updatedAiCases = [...(targetPatient.aiCases || []), { ...aiCaseData, date: new Date().toISOString() }];
    
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, aiCases: updatedAiCases } : p));
    
    try {
      await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiCases: updatedAiCases })
      });
    } catch (e) {
      console.error('Failed to save AI case in DB', e);
    }
  };

  return (
    <AppContext.Provider value={{
      role, setRole,
      doctorProfile: docProfile, updateDoctorProfile,
      doctorsList,
      patients, addPatient,
      claims, updateClaimStatus,
      prescriptions,
      analytics, bookAppointment,
      uploadReport, addMedication,
      addAiCase
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
