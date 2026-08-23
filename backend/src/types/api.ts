export type InputType = 'text' | 'screenshot' | 'pdf' | 'url';

export interface AnalyzeRequest {
  inputType: InputType;
  text?: string;
  url?: string;
  file?: Express.Multer.File;
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