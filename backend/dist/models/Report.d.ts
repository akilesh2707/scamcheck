import mongoose, { Document } from 'mongoose';
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
    alternatives: Array<Record<string, unknown>>;
    valueAnalysis: Record<string, unknown>;
    recommendation: Record<string, unknown>;
    evidenceLabels: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Report: mongoose.Model<IReport, {}, {}, {}, mongoose.Document<unknown, {}, IReport, {}, {}> & IReport & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Report.d.ts.map