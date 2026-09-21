import { Evidence } from './evidence';

export type OpportunityType =
  | 'INTERNSHIP'
  | 'JOB'
  | 'COURSE'
  | 'CERTIFICATION'
  | 'TRAINING'
  | 'SCHOLARSHIP'
  | 'FELLOWSHIP'
  | 'OTHER';

export interface Organization {
  name: string;
  email?: string;
  website?: string;
  phone?: string;
  address?: string;
}

export interface Fees {
  registration?: number;
  processing?: number;
  securityDeposit?: number;
  placement?: number;
  certificate?: number;
  training?: number;
  currency?: string;
  other?: Record<string, number>;
}

export interface Stipend {
  amount?: number;
  currency?: string;
  period?: 'month' | 'week' | 'year' | 'one-time';
  isEstimated?: boolean;
}

export interface Contact {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface ExtractedOpportunity {
  type?: OpportunityType;
  organization?: Organization;
  role?: string;
  description?: string;
  fees?: Fees;
  stipend?: Stipend;
  duration?: string;
  contacts?: Contact[];
  urls?: string[];
  eligibility?: string[];
  skills?: string[];
  claimedBenefits?: string[];
  deadlines?: string[];
  claims?: Evidence[];
  rawText?: string;
}