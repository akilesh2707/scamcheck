import mongoose, { Document } from 'mongoose';
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
export declare const Opportunity: mongoose.Model<IOpportunity, {}, {}, {}, mongoose.Document<unknown, {}, IOpportunity, {}, {}> & IOpportunity & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Opportunity.d.ts.map