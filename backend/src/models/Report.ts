import mongoose, { Document, Schema } from 'mongoose';
import { Types } from 'mongoose';

export interface IReport extends Document {
  userId?: Types.ObjectId;
  opportunityId: Types.ObjectId;
  inputType: 'text' | 'screenshot' | 'pdf' | 'url';
  originalSubmission: Record<string, unknown>;
  normalizedOpportunity: Record<string, unknown>;
  riskAnalysis: Record<string, unknown>;
  credibilityAnalysis: Record<string, unknown>;
  paymentVerification: Record<string, unknown>;
  suitabilityAnalysis: Record<string, unknown>;
  alternatives: Record<string, unknown>[];
  valueAnalysis: Record<string, unknown>;
  recommendation: Record<string, unknown>;
  evidenceLabels: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    inputType: { type: String, enum: ['text', 'screenshot', 'pdf', 'url'], required: true },
    originalSubmission: { type: Schema.Types.Mixed, default: {} },
    normalizedOpportunity: { type: Schema.Types.Mixed, default: {} },
    riskAnalysis: { type: Schema.Types.Mixed, default: {} },
    credibilityAnalysis: { type: Schema.Types.Mixed, default: {} },
    paymentVerification: { type: Schema.Types.Mixed, default: {} },
    suitabilityAnalysis: { type: Schema.Types.Mixed, default: {} },
    alternatives: { type: [Schema.Types.Mixed], default: [] },
    valueAnalysis: { type: Schema.Types.Mixed, default: {} },
    recommendation: { type: Schema.Types.Mixed, default: {} },
    evidenceLabels: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ opportunityId: 1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);