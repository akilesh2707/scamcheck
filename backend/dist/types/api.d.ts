export type InputType = 'text' | 'screenshot' | 'pdf' | 'url';
export interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    destination?: string;
    filename?: string;
    path?: string;
}
export interface AnalyzeRequest {
    inputType: InputType;
    text?: string;
    url?: string;
    file?: MulterFile;
    userProfile?: UserProfile;
}
export interface UserProfile {
    education?: string[];
    skills?: string[];
    interests?: string[];
    careerGoals?: string[];
    experience?: string[];
    budget?: number;
    availableTime?: string;
    preferredLearningMode?: 'ONLINE' | 'OFFLINE' | 'HYBRID';
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
}
export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
//# sourceMappingURL=api.d.ts.map