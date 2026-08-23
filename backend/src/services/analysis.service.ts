import crypto from 'crypto';
import { mlClient } from './mlClient.service';
import { Opportunity } from '../models/Opportunity';
import { Report } from '../models/Report';
import { ExtractedOpportunity } from '../types/opportunity';
import {
  AnalysisReport,
  RiskAnalysis,
  CredibilityAnalysis,
  PaymentVerification,
  SuitabilityAnalysis,
  Alternative,
  ValueAnalysis,
  Recommendation,
  RiskLevel,
} from '../types/report';
import { EvidenceStatus, RiskIndicator, Evidence } from '../types/evidence';
import { UserProfile } from '../types/api';
import { logger } from '../utils/logger';

const RISK_WEIGHTS = {
  PAYMENT_REQUEST: 30,
  URGENCY_PRESSURE: 25,
  SENSITIVE_INFO_REQUEST: 35,
  UNREALISTIC_COMPENSATION: 20,
  GUARANTEED_PLACEMENT: 30,
  IDENTITY_MISMATCH: 15,
  SUSPICIOUS_CLAIMS: 20,
  POOR_WEBSITE_CREDIBILITY: 15,
  UNVERIFIED_COMPANY: 10,
};

function calculateRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'LOW';
  if (score <= 40) return 'MODERATE';
  if (score <= 60) return 'MEDIUM';
  if (score <= 80) return 'HIGH';
  return 'VERY_HIGH';
}

function generateRecommendation(
  risk: RiskAnalysis,
  credibility: CredibilityAnalysis,
  payment: PaymentVerification,
  suitability: SuitabilityAnalysis
): Recommendation {
  const reasons: string[] = [];
  const nextSteps: string[] = [];

  // Matrix:
  // IF Risk == VERY_HIGH OR Payment == CONTRADICTED -> AVOID
  // IF Risk == HIGH OR Credibility.website.status == CONTRADICTED -> CAUTION
  // IF Risk == MEDIUM OR Payment == NEEDS_VERIFICATION -> VERIFY_BEFORE_PROCEEDING
  // ELSE -> SAFE

  if (risk.level === 'VERY_HIGH') {
    reasons.push('Critical high-risk indicators detected.');
    nextSteps.push('Do not proceed under any circumstances.');
  }

  if (payment.required && payment.status === 'CONTRADICTED') {
    reasons.push('Payment requirement contradicts known legitimate sources.');
    nextSteps.push('Do not make the requested payment.');
  }

  if (risk.level === 'HIGH') {
    reasons.push('High-risk indicators observed in the opportunity description.');
    nextSteps.push('Extreme caution advised. Verify all claims independently.');
  }

  const credStatus = credibility.evidence?.find(e => e.claim === 'Page Accessibility')?.status;
  if (credStatus === 'CONTRADICTED' || (credibility.website.score !== undefined && credibility.website.score < 40)) {
    reasons.push('Website or organization credibility is highly suspect.');
    nextSteps.push('Verify the organization through its official known channels, not the provided links.');
  }

  if (risk.level === 'MEDIUM') {
    reasons.push('Some risk indicators are present that warrant further investigation.');
    nextSteps.push('Do not share sensitive information until verified.');
  }

  if (payment.required && (payment.status === 'NEEDS_VERIFICATION' || payment.status === 'UNCERTAIN')) {
    reasons.push('An upfront payment is requested but could not be independently verified as legitimate.');
    nextSteps.push('Verify if this fee is standard practice for this organization before paying.');
  }

  if (risk.level === 'LOW' && reasons.length === 0) {
    return {
      decision: 'SAFE_TO_EXPLORE',
      reasons: ['No major risk indicators detected in the provided text.'],
      nextSteps: ['Proceed with standard due diligence.'],
    };
  }

  if (risk.level === 'VERY_HIGH' || (payment.required && payment.status === 'CONTRADICTED')) {
    return {
      decision: 'AVOID_PAYMENT',
      reasons,
      nextSteps,
    };
  }

  if (risk.level === 'HIGH' || credStatus === 'CONTRADICTED') {
    return {
      decision: 'CAUTION',
      reasons,
      nextSteps,
    };
  }

  return {
    decision: 'VERIFY_FIRST',
    reasons,
    nextSteps,
  };
}

function createDefaultEvidence(claim: string, status: EvidenceStatus, details?: string): Evidence {
  return {
    claim,
    status,
    details,
    checkedAt: new Date().toISOString(),
  };
}

export class AnalysisService {
  async analyzeText(text: string, userId?: string, userProfile?: UserProfile): Promise<AnalysisReport> {
    logger.info('Starting analysis', { textLength: text.length, userId });

    let extractedOpportunity: ExtractedOpportunity;
    
    try {
      extractedOpportunity = await mlClient.extractOpportunity(text);
      logger.info('Opportunity extracted', { type: extractedOpportunity.type });
    } catch (error) {
      logger.warn('ML extraction failed, using basic extraction', { error: (error as Error).message });
      extractedOpportunity = this.basicExtraction(text);
    }

    const opportunityDoc = await Opportunity.create({
      userId,
      inputType: 'text',
      originalText: text,
      extractedData: extractedOpportunity,
    });

    let riskAnalysis: RiskAnalysis;
    let credibilityAnalysis: CredibilityAnalysis;
    let paymentVerification: PaymentVerification;
    let suitabilityAnalysis: SuitabilityAnalysis;
    let alternatives: Alternative[] = [];


    try {
      const mlRisk = await mlClient.analyzeRisk(extractedOpportunity);
      riskAnalysis = {
        score: mlRisk.score,
        level: mlRisk.level as RiskLevel,
        indicators: mlRisk.indicators,
        weights: RISK_WEIGHTS,
      };
    } catch (error) {
      logger.warn('ML risk analysis failed, using local rules', { error: (error as Error).message });
      riskAnalysis = this.localRiskAnalysis(extractedOpportunity);
    }

    try {
      const mlCred: any = await mlClient.analyzeCredibility(extractedOpportunity);
      credibilityAnalysis = {
        score: mlCred.score || 50,
        website: {
          hasHttps: mlCred.hasHttps || false,
          hasPrivacyPolicy: mlCred.hasPrivacyPolicy || false,
          hasTerms: mlCred.hasTerms || false,
          hasRefundPolicy: mlCred.hasRefundPolicy || false,
          hasContactInfo: mlCred.hasContactInfo || false,
          score: mlCred.score || 50,
          evidence: mlCred.evidence || [],
        },
        company: { emailDomainMatch: false, applicationDomainMatch: false, contactConsistency: false, evidence: [] },
        evidence: mlCred.evidence ? mlCred.evidence.map((e: any) => createDefaultEvidence('', e)) : [],
      };
    } catch (error) {
      logger.warn('ML credibility analysis failed', { error: (error as Error).message });
      credibilityAnalysis = {
        website: { hasHttps: false, hasPrivacyPolicy: false, hasTerms: false, hasRefundPolicy: false, hasContactInfo: false, evidence: [] },
        company: { emailDomainMatch: false, applicationDomainMatch: false, contactConsistency: false, evidence: [] },
        evidence: [],
      };
    }

    try {
      const mlPayment = await mlClient.verifyPayment(extractedOpportunity);
      paymentVerification = {
        required: mlPayment.required,
        amount: mlPayment.amount,
        status: mlPayment.status as PaymentVerification['status'],
        confidence: mlPayment.confidence,
        evidence: mlPayment.evidence.map((e) => createDefaultEvidence('', e)),
      };
    } catch (error) {
      logger.warn('ML payment verification failed', { error: (error as Error).message });
      paymentVerification = this.localPaymentVerification(extractedOpportunity);
    }

    try {
      const mlSuitability = await mlClient.analyzeSuitability(extractedOpportunity, userProfile || {});
      suitabilityAnalysis = mlSuitability;
    } catch (error) {
      logger.warn('ML suitability analysis failed', { error: (error as Error).message });
      suitabilityAnalysis = {
        score: null,
        breakdown: {},
        skillGap: [],
        status: 'NOT_IMPLEMENTED' as SuitabilityAnalysis['status'],
      };
    }

    try {
      const mlAlternatives = await mlClient.findAlternatives(extractedOpportunity, userProfile || {});
      alternatives = mlAlternatives.alternatives;
    } catch (error) {
      logger.warn('ML alternatives failed', { error: (error as Error).message });
      alternatives = [];
    }

    const valueAnalysis: ValueAnalysis = {
      score: null,
      potentialSaving: 0,
      alternatives,
    };

    const recommendation = generateRecommendation(riskAnalysis, credibilityAnalysis, paymentVerification, suitabilityAnalysis);

    const evidenceLabels: Record<string, Evidence> = {};
    riskAnalysis.indicators.forEach((indicator) => {
      evidenceLabels[indicator.code] = createDefaultEvidence(indicator.explanation, indicator.evidence, indicator.details);
    });

    const reportDoc = await Report.create({
      userId,
      opportunityId: opportunityDoc._id,
      inputType: 'text',
      originalSubmission: { text },
      normalizedOpportunity: extractedOpportunity,
      riskAnalysis,
      credibilityAnalysis,
      paymentVerification,
      suitabilityAnalysis,
      alternatives,
      valueAnalysis,
      recommendation,
      evidenceLabels,
    });

    const report: AnalysisReport = {
      opportunity: extractedOpportunity,
      risk: riskAnalysis,
      credibility: credibilityAnalysis,
      payment: paymentVerification,
      suitability: suitabilityAnalysis,
      alternatives,
      value: valueAnalysis,
      recommendation,
      evidenceLabels,
      createdAt: new Date().toISOString(),
      id: reportDoc._id.toString(),
    };

    logger.info('Analysis complete', { reportId: report.id, riskLevel: riskAnalysis.level });
    return report;
  }

  private basicExtraction(text: string): ExtractedOpportunity {
    const lowerText = text.toLowerCase();
    
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const urlRegex = /https?:\/\/[^\s]+/g;
    const phoneRegex = /[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,3}[)]?[-\s.]?[0-9]{4,6}/g;
    
    const emails = text.match(emailRegex) || [];
    const urls = text.match(urlRegex) || [];
    const phones = text.match(phoneRegex) || [];

    const feeMatches = text.match(/[₹$]\s?[\d,]+/g) || [];
    const stipendMatches = text.match(/(?:stipend|salary|pay|compensation)[:\s]*[₹$]\s?[\d,]+/gi) || [];

    return {
      type: 'OTHER',
      organization: {
        name: this.extractOrgName(text, emails),
        email: emails[0],
        website: urls[0],
      },
      role: this.extractRole(text),
      description: text.substring(0, 500),
      fees: this.extractFees(text),
      stipend: this.extractStipend(text),
      contacts: emails.map((email, i) => ({ email, phone: phones[i] })),
      urls,
      skills: [],
      eligibility: [],
      claimedBenefits: [],
      deadlines: [],
      claims: [],
      rawText: text,
    };
  }

  private extractOrgName(text: string, emails: string[]): string {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('company') || line.toLowerCase().includes('organization')) {
        const afterColon = line.split(':')[1];
        if (afterColon) return afterColon.trim();
      }
    }
    if (emails[0]) {
      const domain = emails[0].split('@')[1];
      return domain.split('.')[0];
    }
    return 'Unknown Organization';
  }

  private extractRole(text: string): string {
    const roleKeywords = ['intern', 'developer', 'engineer', 'analyst', 'manager', 'trainee', 'associate'];
    const lowerText = text.toLowerCase();
    for (const keyword of roleKeywords) {
      if (lowerText.includes(keyword)) {
        const index = lowerText.indexOf(keyword);
        const start = Math.max(0, index - 20);
        const end = Math.min(text.length, index + keyword.length + 20);
        return text.substring(start, end).trim();
      }
    }
    return 'Not specified';
  }

  private extractFees(text: string): any {
    const fees: any = {};
    const feePatterns = [
      { key: 'registration', patterns: ['registration fee', 'registration amount', 'register'] },
      { key: 'processing', patterns: ['processing fee', 'processing charge'] },
      { key: 'securityDeposit', patterns: ['security deposit', 'deposit'] },
      { key: 'placement', patterns: ['placement fee', 'placement charge'] },
      { key: 'certificate', patterns: ['certificate fee', 'certification fee'] },
      { key: 'training', patterns: ['training fee', 'course fee', 'program fee'] },
    ];

    const lowerText = text.toLowerCase();
    const amountRegex = /[₹$]\s?([\d,]+)/g;

    for (const { key, patterns } of feePatterns) {
      for (const pattern of patterns) {
        if (lowerText.includes(pattern)) {
          const match = text.match(new RegExp(`${pattern}[^₹$]*([₹$]\\s?[\\d,]+)`, 'i'));
          if (match) {
            fees[key] = parseInt(match[1].replace(/[₹$,]/g, ''), 10);
            break;
          }
        }
      }
    }
    return Object.keys(fees).length > 0 ? fees : undefined;
  }

  private extractStipend(text: string): any {
    const stipendMatch = text.match(/(?:stipend|salary|pay|compensation)[:\s]*[₹$]\s?([\d,]+)/i);
    if (stipendMatch) {
      return {
        amount: parseInt(stipendMatch[1].replace(/,/g, ''), 10),
        currency: 'INR',
        period: 'month',
      };
    }
    return undefined;
  }

  private localRiskAnalysis(opportunity: ExtractedOpportunity): RiskAnalysis {
    const indicators: RiskIndicator[] = [];
    let totalScore = 0;

    const text = (opportunity.rawText || '').toLowerCase();
    const orgName = opportunity.organization?.name?.toLowerCase() || '';
    const orgEmail = opportunity.organization?.email?.toLowerCase() || '';
    const orgWebsite = opportunity.organization?.website?.toLowerCase() || '';

    if (opportunity.fees && Object.keys(opportunity.fees).some(k => (opportunity.fees as any)[k] > 0)) {
      indicators.push({
        code: 'PAYMENT_REQUEST',
        title: 'Payment requested',
        explanation: 'The opportunity requests an upfront payment',
        points: RISK_WEIGHTS.PAYMENT_REQUEST,
        evidence: 'VERIFIED' as EvidenceStatus,
        details: `Fees found: ${JSON.stringify(opportunity.fees)}`,
      });
      totalScore += RISK_WEIGHTS.PAYMENT_REQUEST;
    }

    const urgencyPatterns = ['limited seats', 'act now', 'expires today', 'pay immediately', 'last chance', 'hurry', 'deadline', 'only', 'seats left', 'few seats'];
    if (urgencyPatterns.some(p => text.includes(p))) {
      indicators.push({
        code: 'URGENCY_PRESSURE',
        title: 'Urgency pressure',
        explanation: 'The opportunity uses urgency language to pressure quick decisions',
        points: RISK_WEIGHTS.URGENCY_PRESSURE,
        evidence: 'VERIFIED' as EvidenceStatus,
      });
      totalScore += RISK_WEIGHTS.URGENCY_PRESSURE;
    }

    const sensitivePatterns = ['otp', 'cvv', 'pin', 'password', 'bank account', 'credit card', 'debit card', 'banking credentials'];
    if (sensitivePatterns.some(p => text.includes(p))) {
      indicators.push({
        code: 'SENSITIVE_INFO_REQUEST',
        title: 'Sensitive information requested',
        explanation: 'The opportunity requests sensitive personal or financial information',
        points: RISK_WEIGHTS.SENSITIVE_INFO_REQUEST,
        evidence: 'VERIFIED' as EvidenceStatus,
      });
      totalScore += RISK_WEIGHTS.SENSITIVE_INFO_REQUEST;
    }

    if (opportunity.stipend && opportunity.stipend.amount && opportunity.stipend.amount > 100000) {
      indicators.push({
        code: 'UNREALISTIC_COMPENSATION',
        title: 'Unrealistic compensation',
        explanation: 'The claimed compensation is unusually high for the role type',
        points: RISK_WEIGHTS.UNREALISTIC_COMPENSATION,
        evidence: 'LIKELY' as EvidenceStatus,
      });
      totalScore += RISK_WEIGHTS.UNREALISTIC_COMPENSATION;
    }

    const guaranteePatterns = ['guaranteed job', 'guaranteed placement', 'guaranteed income', '100% placement', 'assured job'];
    if (guaranteePatterns.some(p => text.includes(p))) {
      indicators.push({
        code: 'GUARANTEED_PLACEMENT',
        title: 'Guaranteed placement claim',
        explanation: 'The opportunity makes unrealistic guarantees about job placement',
        points: RISK_WEIGHTS.GUARANTEED_PLACEMENT,
        evidence: 'VERIFIED' as EvidenceStatus,
      });
      totalScore += RISK_WEIGHTS.GUARANTEED_PLACEMENT;
    }

    if (orgEmail && orgName) {
      const emailDomain = orgEmail.split('@')[1];
      const orgDomain = orgWebsite.replace(/https?:\/\//, '').split('/')[0];
      if (emailDomain && orgDomain && !orgDomain.includes(emailDomain) && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(emailDomain)) {
        indicators.push({
          code: 'IDENTITY_MISMATCH',
          title: 'Email/domain mismatch',
          explanation: 'Contact email domain does not match organization website domain',
          points: RISK_WEIGHTS.IDENTITY_MISMATCH,
          evidence: 'LIKELY' as EvidenceStatus,
        });
        totalScore += RISK_WEIGHTS.IDENTITY_MISMATCH;
      }
    }

    return {
      score: Math.min(totalScore, 100),
      level: calculateRiskLevel(totalScore),
      indicators,
      weights: RISK_WEIGHTS,
    };
  }

  private localPaymentVerification(opportunity: ExtractedOpportunity): PaymentVerification {
    const fees = opportunity.fees as Record<string, number> | undefined;
    const hasFees = fees && Object.values(fees).some(v => v > 0);
    const totalFees = hasFees ? Object.values(fees).reduce((a: number, b: number) => a + b, 0) : 0;

    return {
      required: hasFees ?? false,
      amount: hasFees ? totalFees : null,
      status: hasFees ? 'NEEDS_VERIFICATION' : 'NOT_FOUND',
      confidence: 0.5,
      evidence: [
        {
          claim: 'Payment requirement in text',
          status: hasFees ? 'OBSERVED' : 'NOT_FOUND',
          details: hasFees ? `Fees detected: ${JSON.stringify(fees)}` : 'No payment mentioned',
          checkedAt: new Date().toISOString(),
        },
      ],
    };
  }

  async getReportById(reportId: string): Promise<AnalysisReport | null> {
    const report = await Report.findById(reportId).lean();
    if (!report) return null;

    return {
      opportunity: report.normalizedOpportunity as unknown as ExtractedOpportunity,
      risk: report.riskAnalysis as unknown as RiskAnalysis,
      credibility: report.credibilityAnalysis as unknown as CredibilityAnalysis,
      payment: report.paymentVerification as unknown as PaymentVerification,
      suitability: report.suitabilityAnalysis as unknown as SuitabilityAnalysis,
      alternatives: report.alternatives as unknown as Alternative[],
      value: report.valueAnalysis as unknown as ValueAnalysis,
      recommendation: report.recommendation as unknown as Recommendation,
      evidenceLabels: report.evidenceLabels as unknown as Record<string, Evidence>,
      createdAt: report.createdAt.toISOString(),
      id: report._id.toString(),
    };
  }

  async getHistory(userId: string, page: number = 1, limit: number = 20): Promise<{ reports: AnalysisReport[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      Report.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Report.countDocuments({ userId }),
    ]);

    return {
      reports: reports.map(r => ({
        opportunity: r.normalizedOpportunity as unknown as ExtractedOpportunity,
        risk: r.riskAnalysis as unknown as RiskAnalysis,
        credibility: r.credibilityAnalysis as unknown as CredibilityAnalysis,
        payment: r.paymentVerification as unknown as PaymentVerification,
        suitability: r.suitabilityAnalysis as unknown as SuitabilityAnalysis,
        alternatives: r.alternatives as unknown as Alternative[],
        value: r.valueAnalysis as unknown as ValueAnalysis,
        recommendation: r.recommendation as unknown as Recommendation,
        evidenceLabels: r.evidenceLabels as unknown as Record<string, Evidence>,
        createdAt: r.createdAt.toISOString(),
        id: r._id.toString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const analysisService = new AnalysisService();