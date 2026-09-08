import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: String,
  time: String,
  text: String,
});

const ChatSchema = new mongoose.Schema({
  patientId: String,
  doctorId: String,
  messages: [MessageSchema],
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
