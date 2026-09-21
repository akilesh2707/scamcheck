import mongoose, { Document, Schema } from 'mongoose';
import { Types } from 'mongoose';

export interface IUserProfile extends Document {
  userId: Types.ObjectId;
  education: string[];
  degree?: string;
  graduationYear?: number;
  experienceLevel?: string;
  skills: string[]; // technical skills
  softSkills: string[];
  preferredRoles: string[];
  preferredIndustries: string[];
  careerGoals: string[];
  experience: string[];
  location?: string;
  remotePreference?: string;
  expectedSalary?: number;
  maxPaymentWillingness?: number;
  learningGoals: string[];
  budget: number;
  availableTime?: string;
  preferredLearningMode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    education: [{ type: String, trim: true }],
    degree: { type: String, trim: true },
    graduationYear: { type: Number },
    experienceLevel: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    softSkills: [{ type: String, trim: true }],
    preferredRoles: [{ type: String, trim: true }],
    preferredIndustries: [{ type: String, trim: true }],
    careerGoals: [{ type: String, trim: true }],
    experience: [{ type: String, trim: true }],
    location: { type: String, trim: true },
    remotePreference: { type: String, trim: true },
    expectedSalary: { type: Number, min: 0 },
    maxPaymentWillingness: { type: Number, min: 0 },
    learningGoals: [{ type: String, trim: true }],
    budget: { type: Number, default: 0, min: 0 },
    availableTime: { type: String, trim: true },
    preferredLearningMode: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'HYBRID'],
      default: 'ONLINE'
    },
  },
  { timestamps: true }
);

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);