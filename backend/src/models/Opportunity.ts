import mongoose, { Document, Schema } from 'mongoose';
import { Types } from 'mongoose';

export interface IOpportunity extends Document {
  userId?: Types.ObjectId;
  inputType: 'text' | 'screenshot' | 'pdf' | 'url';
  originalText?: string;
  originalUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  extractedData: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const opportunitySchema = new Schema<IOpportunity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    inputType: { type: String, enum: ['text', 'screenshot', 'pdf', 'url'], required: true },
    originalText: { type: String },
    originalUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    extractedData: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

opportunitySchema.index({ userId: 1, createdAt: -1 });

export const Opportunity = mongoose.model<IOpportunity>('Opportunity', opportunitySchema);