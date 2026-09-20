export type EvidenceStatus = 
  | 'SUPPORTED'
  | 'CONTRADICTED' 
  | 'NOT_VERIFIED' 
  | 'UNAVAILABLE' 
  | 'INFERRED';

export interface Evidence {
  claim: string;
  status: EvidenceStatus;
  sourceType?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  details?: string;
  observedAt?: string;
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