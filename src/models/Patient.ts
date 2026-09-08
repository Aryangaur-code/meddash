import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  id: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  residence: string;
  vitals: {
    bp: string;
    hr: number;
    spo2: number;
    temp: number;
  };
  chronicConditions: string[];
  medications: string[];
  allergies: string[];
  recentVisits: any[];
  reports: any[];
  aiCases: any[];
}

const PatientSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  mrn: { type: String },
  residence: { type: String },
  vitals: {
    bp: String,
    hr: Number,
    spo2: Number,
    temp: Number
  },
  chronicConditions: [String],
  medications: [String],
  allergies: [String],
  recentVisits: [Schema.Types.Mixed],
  reports: [Schema.Types.Mixed],
  aiCases: [Schema.Types.Mixed]
}, { timestamps: true });

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
