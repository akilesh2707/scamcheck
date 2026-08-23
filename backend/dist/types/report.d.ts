import { ExtractedOpportunity } from './opportunity';
import { RiskIndicator, Evidence } from './evidence';
export type RiskLevel = 'LOW' | 'MODERATE' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
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
export type PaymentStatus = 'VERIFIED' | 'NOT_FOUND' | 'CONTRADICTED' | 'UNKNOWN' | 'NOT_IMPLEMENTED';
export interface PaymentVerification {
    required: boolean | null;
    amount: number | null;
    status: PaymentStatus;
    confidence: number;
    evidence: Evidence[];
}
export interface SuitabilityBreakdown {
    skillMatch?: number;
    careerMatch?: number;
    experienceMatch?: number;
    eligibilityMatch?: number;
    timeFit?: number;
    costFit?: number;
}
export interface SkillGapItem {
    skill: string;
    required: boolean;
    currentLevel?: string;
    requiredLevel?: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    resources?: string[];
}
export interface SuitabilityAnalysis {
    score: number | null;
    breakdown: SuitabilityBreakdown;
    skillGap: SkillGapItem[];
    status: 'COMPLETE' | 'INSUFFICIENT_PROFILE_DATA' | 'NOT_IMPLEMENTED';
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
}
export type RecommendationDecision = 'SAFE_TO_EXPLORE' | 'CAUTION' | 'VERIFY_FIRST' | 'AVOID_PAYMENT' | 'INSUFFICIENT_EVIDENCE';
export interface Recommendation {
    decision: RecommendationDecision;
    reasons: string[];
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
//# sourceMappingURL=report.d.ts.map