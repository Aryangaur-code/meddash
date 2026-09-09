import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Doctor from '@/models/Doctor';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await connectToDatabase();
    
    const doc = await Doctor.findOne({ id });
    if (doc) return NextResponse.json(doc);
    
    return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
  } catch (error) {
    console.error('Doctor Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
