import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import Patient from '@/models/Patient';

export async function GET() {
  try {
    await connectToDatabase();
    
    const newId = `PAT-DEBUG-${Date.now()}`;
    const profile = {
      name: 'Aryan', // Intentionally using the name from screenshot
      age: 30,
      gender: 'Male',
      residence: '318-A',
      vitals: { bp: '120/80', hr: 72, spo2: 98, temp: 98.6 },
      chronicConditions: [],
      medications: [],
      allergies: [],
    };

    const newPat = new Patient({ ...profile, id: newId, mrn: `MRN-${Date.now()}` });
    await newPat.save();
    
    // Clean up
    await Patient.deleteOne({ id: newId });

    return NextResponse.json({ success: true, message: 'Debug save successful' });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      errorStack: error.stack
    });
  }
}
