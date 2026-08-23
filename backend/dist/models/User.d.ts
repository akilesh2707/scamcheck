import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    passwordHash: string;
    name?: string;
    role: 'user' | 'admin';
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map