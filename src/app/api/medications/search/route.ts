import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 });
  }

  // MOCK DEMO RESPONSE (1GB local SQLite database removed for Vercel Serverless deployment)
  const mockFields = {
    Contains: 'Active Pharmaceutical Ingredient (API)',
    ProductUses: 'This medication is used to treat high blood pressure (hypertension). Lowering high blood pressure helps prevent strokes, heart attacks, and kidney problems.',
    SideEffect: 'Dizziness, lightheadedness, or blurred vision may occur as your body adjusts to the medication. Dry cough or mild stomach upset may also occur.',
    HowWorks: 'It works by relaxing blood vessels so blood can flow more easily. It belongs to a class of drugs known as angiotensin receptor blockers (ARBs) or ACE inhibitors depending on the compound.',
    SafetyAdvice: 'Alcohol: Avoid drinking alcohol as it can lower blood pressure further. Pregnancy: Not recommended. Driving: May cause dizziness, avoid driving until you know how it affects you.'
  };

  const mockMedications = [
    { id: 1, Name: `${q.toUpperCase()} 500mg (Generic)`, Therapeutic_Class: 'Analgesic', Action_Class: 'Pain Relief', Standard_FDA_Name: q, ...mockFields },
    { id: 2, Name: `${q.toUpperCase()} Extended Release 1000mg`, Therapeutic_Class: 'Analgesic', Action_Class: 'Pain Relief', Standard_FDA_Name: q, ...mockFields },
    { id: 3, Name: `${q.toUpperCase()} Oral Suspension 100ml`, Therapeutic_Class: 'Antibiotic', Action_Class: 'Infection Control', Standard_FDA_Name: q, ...mockFields },
    { id: 4, Name: `${q.toUpperCase()} + Compound`, Therapeutic_Class: 'Anti-inflammatory', Action_Class: 'Fever & Pain', Standard_FDA_Name: q, ...mockFields },
  ];

  return NextResponse.json({ medications: mockMedications }, { status: 200 });
}
