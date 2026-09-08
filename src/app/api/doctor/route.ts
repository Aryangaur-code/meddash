import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import { doctorProfile as mockDoctorProfile } from '@/data/mockData';

export async function GET() {
  try {
    await connectToDatabase();
    let doctor = await Doctor.findOne({ id: 'DOC-1' });
    
    if (!doctor) {
      // Seed with mock data if not exists
      doctor = new Doctor({ ...mockDoctorProfile, id: 'DOC-1' });
      await doctor.save();
    }
    
    return NextResponse.json(doctor);
  } catch (error) {
    console.error('MongoDB GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch doctor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Upsert DOC-1
    const doctor = await Doctor.findOneAndUpdate(
      { id: 'DOC-1' },
      { ...body, id: 'DOC-1' },
      { new: true, upsert: true }
    );
    
    return NextResponse.json(doctor);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save doctor' }, { status: 500 });
  }
}
