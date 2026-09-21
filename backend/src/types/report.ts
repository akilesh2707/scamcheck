import { ExtractedOpportunity } from './opportunity';
import { RiskIndicator, Evidence, CrossSourceCheck } from './evidence';

export type RiskLevel = 'LOW' | 'MODERATE' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | 'UNKNOWN';

export interface RiskAnalysis {
  score: number;
  level: RiskLevel;
  indicators: RiskIndicator[];
  weights?: Record<string, number>;
}

export interface WebsiteAnalysis {
  hasHttps: boolean;
  domainAge?: number;
  hasPrivacyPolicy: boolean;
  hasTerms: boolean;
  hasRefundPolicy: boolean;
  hasContactInfo: boolean;
  domainStructure?: string;
  score?: number;
  evidence: Evidence[];
}

export interface CompanyVerification {
  organizationName?: string;
  emailDomainMatch: boolean;
  applicationDomainMatch: boolean;
  contactConsistency: boolean;
  score?: number;
  evidence: Evidence[];
}

export interface CredibilityAnalysis {
  score?: number;
  website: WebsiteAnalysis;
  company: CompanyVerification;
  evidence: Evidence[];
}

export type PaymentStatus = 'VERIFIED' | 'NEEDS_VERIFICATION' | 'NEGATED' | 'NOT_FOUND' | 'CONTRADICTED' | 'UNKNOWN' | 'UNCERTAIN' | 'NOT_IMPLEMENTED';

export interface PaymentVerification {
  required: boolean | null;
  amount: number | null;
  currency?: string | null;
  purpose?: string | null;
  paymentType?: string | null;
  refundable?: boolean | null;
  status: PaymentStatus;
  confidence: number;
  evidence: Evidence[];
}

export interface SuitabilityComponent {
  score: number | null;
  status: 'SUPPORTED' | 'INFERRED' | 'NOT_VERIFIED' | 'UNAVAILABLE';
  reason?: string;
}

export interface SuitabilityBreakdown {
  skills: SuitabilityComponent;
  education: SuitabilityComponent;
  experience: SuitabilityComponent;
  careerGoals: SuitabilityComponent;
  compensation: SuitabilityComponent;
  location: SuitabilityComponent;
  budget: SuitabilityComponent;
}

export interface SkillGapItem {
  skill: string;
  required: boolean;
  currentLevel?: string;
  requiredLevel?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  resources?: string[];
  status?: 'SUPPORTED' | 'INFERRED';
  reason?: string;
}

export interface SuitabilityAnalysis {
  overallScore: number | null;
  breakdown: SuitabilityBreakdown;
  skillGap: SkillGapItem[];
  status: 'SUPPORTED' | 'INFERRED' | 'NOT_VERIFIED' | 'UNAVAILABLE';
}

export interface Alternative {
  name: string;
  cost: number;
  contentMatch: number;
  gains: string[];
  losses: string[];
  potentialSaving: number;
  evidence: Evidence[];
  source?: string;
}

export interface ValueAnalysis {
  score: number | null;
  potentialSaving: number;
  alternatives: Alternative[];
  status?: 'COMPLETED' | 'UNAVAILABLE';
}

export type RecommendationDecision =
  | 'SAFE_TO_EXPLORE'
  | 'CAUTION'
  | 'VERIFY_FIRST'
  | 'AVOID_PAYMENT'
  | 'INSUFFICIENT_EVIDENCE';

export interface Recommendation {
  decision: RecommendationDecision;
  summary: string;
  verifiedFacts: string[];
  unverifiedClaims: string[];
  cautionarySignals: string[];
  profileMatches: string[];
  paymentAdvisory: string | null;
  questionsToAsk: string[];
  nextSteps: string[];
}

export interface AnalysisReport {
  opportunity: ExtractedOpportunity;
  risk: RiskAnalysis;
  credibility: CredibilityAnalysis;
  payment: PaymentVerification;
  suitability: SuitabilityAnalysis;
  alternatives: Alternative[];
  value: ValueAnalysis;
  recommendation: Recommendation;
  evidenceLabels: Record<string, Evidence>;
  createdAt: string;
  id: string;
}