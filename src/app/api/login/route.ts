import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import Patient from '@/models/Patient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, role } = body;
    
    await connectToDatabase();
    
    if (role === 'doctor') {
      const doc = await Doctor.findOne({ id });
      if (doc) return NextResponse.json({ success: true, profile: doc });
    } else if (role === 'patient') {
      const pat = await Patient.findOne({ id });
      if (pat) return NextResponse.json({ success: true, profile: pat });
    }
    
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
