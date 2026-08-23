import { ExtractedOpportunity } from '../types/opportunity';
import { RiskIndicator, EvidenceStatus } from '../types/evidence';
import { CredibilityAnalysis, SuitabilityAnalysis, Alternative } from '../types/report';
interface MLRiskResponse {
    score: number;
    level: string;
    indicators: RiskIndicator[];
}
interface MLCredibilityResponse {
    score: number;
    website: CredibilityAnalysis['website'];
    company: CredibilityAnalysis['company'];
    evidence: EvidenceStatus[];
}
interface MLPaymentResponse {
    required: boolean | null;
    amount: number | null;
    status: string;
    confidence: number;
    evidence: EvidenceStatus[];
}
interface MLAlternativesResponse {
    alternatives: Alternative[];
}
export declare class MLClient {
    private client;
    constructor();
    healthCheck(): Promise<boolean>;
    extractOpportunity(text: string): Promise<ExtractedOpportunity>;
    analyzeRisk(opportunity: ExtractedOpportunity): Promise<MLRiskResponse>;
    analyzeCredibility(opportunity: ExtractedOpportunity): Promise<MLCredibilityResponse>;
    verifyPayment(opportunity: ExtractedOpportunity): Promise<MLPaymentResponse>;
    analyzeSuitability(opportunity: ExtractedOpportunity, userProfile: any): Promise<SuitabilityAnalysis>;
    analyzeSkillGap(requiredSkills: string[], userSkills: string[]): Promise<any>;
    findAlternatives(opportunity: ExtractedOpportunity, userProfile?: any): Promise<MLAlternativesResponse>;
    extractCurriculum(text: string): Promise<any>;
    ocrExtract(fileBase64: string, mimeType: string): Promise<{
        text: string;
    }>;
}
export declare const mlClient: MLClient;
export {};
//# sourceMappingURL=mlClient.service.d.ts.map