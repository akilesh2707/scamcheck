export type EvidenceStatus = 
  | 'SUPPORTED'
  | 'CONTRADICTED' 
  | 'NOT_VERIFIED' 
  | 'UNAVAILABLE' 
  | 'INFERRED';

export interface Evidence {
  claim: string;
  status: EvidenceStatus;
  details?: string;
  sourceUrl?: string;
}

export interface Recommendation {
  decision: 'PROCEED' | 'PROCEED_WITH_CAUTION' | 'REJECT' | 'NEEDS_VERIFICATION' | 'UNKNOWN';
  summary: string;
  verifiedFacts: string[];
  cautionarySignals: string[];
}

export interface SuitabilityComponent {
  score: number | null;
  status: EvidenceStatus;
  reason?: string;
}

export interface AnalysisReport {
  opportunity: {
    type: string;
    title: string;
    organization?: string;
  };
  risk: {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
    indicators: any[];
  };
  recommendation: Recommendation;
  suitability?: {
    overallScore: number | null;
    status: EvidenceStatus | 'INSUFFICIENT_PROFILE_DATA';
  };
  payment?: {
    required: boolean | null;
    amount: number | null;
    currency?: string | null;
  };
  credibility?: {
    score?: number;
  };
  id: string;
}

export interface AnalyzeRequest {
  inputType: 'text' | 'url' | 'image' | 'pdf';
  text?: string;
  url?: string;
  // userProfile intentionally omitted for Phase 3A
}
