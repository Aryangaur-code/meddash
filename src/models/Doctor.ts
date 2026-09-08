import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  id: string;
  name: string;
  degree: string;
  specialization: string;
  experience: string;
  postingHospital: string;
  profileText: string;
  age: number;
}

const DoctorSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  degree: { type: String },
  specialization: { type: String },
  experience: { type: String },
  postingHospital: { type: String },
  profileText: { type: String },
  age: { type: Number },
}, { timestamps: true });

export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);
