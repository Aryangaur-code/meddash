import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    
    await connectToDatabase();
    let chat = await Chat.findOne({ patientId, doctorId });
    
    if (!chat) {
      chat = new Chat({ patientId, doctorId, messages: [] });
      await chat.save();
    }
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Chat GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    const chat = await Chat.findOneAndUpdate(
      { patientId: body.patientId, doctorId: body.doctorId },
      { $push: { messages: body.message } },
      { new: true, upsert: true }
    );
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Chat POST Error:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
