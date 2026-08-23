import mongoose, { Document } from 'mongoose';
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
export declare const UserProfile: mongoose.Model<IUserProfile, {}, {}, {}, mongoose.Document<unknown, {}, IUserProfile, {}, {}> & IUserProfile & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=UserProfile.d.ts.map