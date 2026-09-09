import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Patient from '@/models/Patient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await connectToDatabase();
    
    const pat = await Patient.findOne({ id });
    if (pat) return NextResponse.json(pat);
    
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  } catch (error) {
    console.error('Patient Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
