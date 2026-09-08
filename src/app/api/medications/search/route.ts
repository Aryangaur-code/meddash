import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 });
  }

  try {
    // Open the SQLite database
    const dbPath = path.join(process.cwd(), 'mid.db');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Perform search using LIKE on the Name column, limit to 20 results
    const medications = await db.all(
      `SELECT * FROM medications WHERE Name LIKE ? LIMIT 20`,
      [`%${q}%`]
    );

    await db.close();

    return NextResponse.json({ medications }, { status: 200 });
  } catch (error) {
    console.error('Error querying mid.db:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
