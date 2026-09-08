import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Patient from '@/models/Patient';
import { patients as mockPatients } from '@/data/mockData';

export async function GET() {
  try {
    await connectToDatabase();
    let patients = await Patient.find({});
    
    // Seed if empty
    if (patients.length === 0) {
      await Patient.insertMany(mockPatients);
      patients = await Patient.find({});
    }
    
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const newPatient = new Patient(body);
    await newPatient.save();
    return NextResponse.json(newPatient);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save patient' }, { status: 500 });
  }
}
