import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'medications_db.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const allMedications = JSON.parse(fileContents);

    const queryLower = q.toLowerCase();
    
    // Filter logic: Find medications where name contains the query
    const results = allMedications.filter((med: any) => 
      med.Name && med.Name.toLowerCase().includes(queryLower)
    );

    // Limit to top 20 to avoid huge payloads
    const limitedResults = results.slice(0, 20);

    return NextResponse.json({ medications: limitedResults }, { status: 200 });
  } catch (error) {
    console.error("Error reading medications DB:", error);
    return NextResponse.json({ error: 'Database read error' }, { status: 500 });
  }
}
