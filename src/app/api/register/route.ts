import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import Patient from '@/models/Patient';

function generateId(role: string) {
  const rand = Math.floor(10000 + Math.random() * 90000); // 5 digit random
  return role === 'doctor' ? `DOC-${rand}` : `P-${rand}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, profile } = body;
    
    await connectToDatabase();
    
    const newId = generateId(role);
    
    if (role === 'doctor') {
      const newDoc = new Doctor({ ...profile, id: newId });
      await newDoc.save();
      return NextResponse.json({ success: true, id: newId, profile: newDoc });
    } else if (role === 'patient') {
      const newPat = new Patient({ ...profile, id: newId, mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}` });
      await newPat.save();
      return NextResponse.json({ success: true, id: newId, profile: newPat });
    }
    
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  } catch (error: any) {
    console.error('Register API Error:', error);
    return NextResponse.json({ error: 'Failed to register', details: error.message }, { status: 500 });
  }
}
