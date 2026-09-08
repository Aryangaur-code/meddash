import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Patient from '@/models/Patient';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const patient = await Patient.findOneAndUpdate(
      { id: params.id },
      { $set: body },
      { new: true }
    );
    
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}
