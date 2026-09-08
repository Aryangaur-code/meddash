import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 });
  }

  // MOCK DEMO RESPONSE (1GB local SQLite database removed for Vercel Serverless deployment)
  const mockMedications = [
    { id: 1, Name: `${q.toUpperCase()} 500mg (Generic)`, Therapeutic_Class: 'Analgesic', Action_Class: 'Pain Relief', Standard_FDA_Name: q },
    { id: 2, Name: `${q.toUpperCase()} Extended Release 1000mg`, Therapeutic_Class: 'Analgesic', Action_Class: 'Pain Relief', Standard_FDA_Name: q },
    { id: 3, Name: `${q.toUpperCase()} Oral Suspension 100ml`, Therapeutic_Class: 'Antibiotic', Action_Class: 'Infection Control', Standard_FDA_Name: q },
    { id: 4, Name: `${q.toUpperCase()} + Compound`, Therapeutic_Class: 'Anti-inflammatory', Action_Class: 'Fever & Pain', Standard_FDA_Name: q },
  ];

  return NextResponse.json({ medications: mockMedications }, { status: 200 });
}
