import mongoose, { Document, Schema } from 'mongoose';
import { Types } from 'mongoose';

export interface IUserProfile extends Document {
  userId: Types.ObjectId;
  education: string[];
  skills: string[];
  interests: string[];
  careerGoals: string[];
  experience: string[];
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
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    careerGoals: [{ type: String, trim: true }],
    experience: [{ type: String, trim: true }],
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