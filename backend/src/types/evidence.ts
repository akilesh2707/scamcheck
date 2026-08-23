export type EvidenceStatus = 
  | 'VERIFIED' 
  | 'LIKELY' 
  | 'UNCERTAIN' 
  | 'CONTRADICTED' 
  | 'NOT_FOUND' 
  | 'NOT_IMPLEMENTED';

export interface Evidence {
  claim: string;
  status: EvidenceStatus;
  source?: string;
  details?: string;
  checkedAt?: string;
  confidence?: number;
}

export interface RiskIndicator {
  code: string;
  title: string;
  explanation: string;
  points: number;
  evidence: EvidenceStatus;
  details?: string;
}

export interface CrossSourceCheck {
  field: string;
  submitted: unknown;
  verified: unknown;
  difference?: unknown;
  status: EvidenceStatus;
  source?: string;
}