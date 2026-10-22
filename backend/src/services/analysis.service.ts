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
  const verifiedFacts: string[] = [];
  const unverifiedClaims: string[] = [];
  const cautionarySignals: string[] = [];
  const profileMatches: string[] = [];
  const questionsToAsk: string[] = [];
  const nextSteps: string[] = [];

  // 1. Process Risk
  if (risk.level === 'VERY_HIGH' || risk.level === 'HIGH') {
    cautionarySignals.push(`High risk detected (Score: ${risk.score}). Proceed with extreme caution.`);
    risk.indicators.forEach(ind => {
      cautionarySignals.push(`${ind.title}: ${ind.explanation}`);
    });
  } else if (risk.level === 'MEDIUM') {
    unverifiedClaims.push('Some risk indicators are present. Clarification needed.');
  }

  // 2. Process Credibility
  const credStatus = credibility.evidence?.find(e => e.claim === 'Page Accessibility')?.status;
  if (credStatus === 'CONTRADICTED' || (credibility.website.score !== undefined && credibility.website.score < 40)) {
    cautionarySignals.push('Website or organization credibility could not be established.');
    questionsToAsk.push('Can you provide an official company email or verified website link?');
  } else if (credibility.website.hasHttps && credibility.company.organizationName) {
    unverifiedClaims.push(`Organization claims to be ${credibility.company.organizationName} and uses a secure domain, but its identity is not independently verified.`);
  }

  // 3. Process Payment
  let paymentAdvisory: string | null = null;
  if (payment.required && payment.status === 'CONTRADICTED') {
    cautionarySignals.push('Payment requirement contradicts known legitimate sources.');
    paymentAdvisory = 'Do not pay. Legitimate organizations typically do not ask for upfront fees for this type of opportunity.';
    nextSteps.push('Cease communication if they insist on payment.');
  } else if (payment.required) {
    unverifiedClaims.push(`An upfront payment of ${payment.amount || 'an unspecified amount'} ${payment.currency || ''} is requested.`);
    paymentAdvisory = 'Verify if this fee is standard practice before paying.';
    questionsToAsk.push('Is the requested fee refundable? What exactly does it cover?');
  } else if (payment.status === 'NEGATED') {
    verifiedFacts.push('The opportunity explicitly states no payment is required.');
  }

  // 4. Process Suitability
  if (suitability.status === 'SUPPORTED' || suitability.status === 'INFERRED') {
    const bd = suitability.breakdown;
    if (bd.skills.status === 'SUPPORTED' || bd.skills.status === 'INFERRED') {
      profileMatches.push(`Your skills match the requirements (${bd.skills.score}% match).`);
    }
    if (suitability.skillGap.length > 0) {
      const gaps = suitability.skillGap.map(g => g.skill).join(', ');
      nextSteps.push(`Consider learning or improving: ${gaps}`);
    }
    if (bd.budget.status === 'SUPPORTED' && bd.budget.score === 100) {
      profileMatches.push('The opportunity fits within your stated budget constraints.');
    } else if (bd.budget.status === 'SUPPORTED' && bd.budget.score === 0) {
      cautionarySignals.push('This opportunity exceeds your maximum payment willingness.');
    }
  }

  // Decision Logic
  let decision: Recommendation['decision'] = 'SAFE_TO_EXPLORE';

  const hasIdentityMismatch = credibility.company && (
    credibility.company.emailDomainMatch === false ||
    credibility.company.contactConsistency === false
  );

  const hasUnresolvedCredibility =
    credibility.evidence?.some(e => e.status === 'NOT_VERIFIED' || e.status === 'UNAVAILABLE' || e.status === 'CONTRADICTED') ||
    credibility.company?.evidence?.some((e: any) => e.status === 'NOT_VERIFIED' || e.status === 'UNAVAILABLE' || e.status === 'CONTRADICTED');

  if (hasIdentityMismatch) {
    cautionarySignals.push('Organization identity or contact details do not match established records.');
  }
  if (hasUnresolvedCredibility && !hasIdentityMismatch) {
    unverifiedClaims.push('Key credibility or identity signals could not be fully verified.');
  }

  if (risk.level === 'VERY_HIGH' || (payment.required && payment.status === 'CONTRADICTED')) {
    decision = 'AVOID_PAYMENT';
    nextSteps.push('Do not proceed under any circumstances.');
  } else if (risk.level === 'HIGH' || credStatus === 'CONTRADICTED' || hasIdentityMismatch) {
    decision = 'CAUTION';
    nextSteps.push('Verify the organization through its official known channels, not the provided links.');
  } else if (risk.level === 'MEDIUM' || hasUnresolvedCredibility || (payment.required && (payment.status === 'UNKNOWN' || payment.status === 'NOT_IMPLEMENTED'))) {
    decision = 'VERIFY_FIRST';
    nextSteps.push('Do not share sensitive information until verified.');
  }

  if (decision === 'SAFE_TO_EXPLORE') {
    nextSteps.push('Proceed with standard due diligence.');
  }

  return {
    decision,
    summary: `Analysis resulted in a decision of ${decision.replace('_', ' ')}.`,
    verifiedFacts,
    unverifiedClaims,
    cautionarySignals,
    profileMatches,
    paymentAdvisory,
    questionsToAsk,
    nextSteps,
  };
}

function createDefaultEvidence(claim: string, status: EvidenceStatus, details?: string): Evidence {
  return {
    claim,
    status,
    details,
    observedAt: new Date().toISOString(),
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
      logger.warn('ML extraction failed, falling back to local extraction', { error: (error as Error).message });
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
      logger.warn('ML risk analysis failed', { error: (error as Error).message });
      riskAnalysis = {
        score: 0,
        level: 'UNKNOWN',
        indicators: [],
        weights: RISK_WEIGHTS,
      };
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
        company: ((): any => {
          const oppEmail = extractedOpportunity.organization?.email?.toLowerCase();
          const oppWebsite = extractedOpportunity.organization?.website?.toLowerCase();
          let emailDomainMatch = false;
          const applicationDomainMatch = false;
          const compEvidence: any[] = [];

          if (oppEmail && oppWebsite) {
            const emailDomain = oppEmail.split('@')[1];
            const orgDomain = oppWebsite.replace(/https?:\/\//, '').split('/')[0];
            if (emailDomain && orgDomain) {
              const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
              emailDomainMatch = orgDomain.includes(emailDomain) || commonDomains.includes(emailDomain);
              compEvidence.push({
                claim: 'Contact email domain matches organization website',
                status: emailDomainMatch ? 'SUPPORTED' : 'CONTRADICTED',
                details: emailDomainMatch ? 'Email domain is consistent with the organization domain.' : 'Organization email domain differs from the provided website.',
                observedAt: new Date().toISOString()
              });
            }
          } else {
            compEvidence.push({
              claim: 'Contact email domain matches organization website',
              status: 'NOT_VERIFIED',
              details: 'Insufficient information to verify email and website domain match.',
              observedAt: new Date().toISOString()
            });
          }

          return {
            organizationName: extractedOpportunity.organization?.name,
            emailDomainMatch,
            applicationDomainMatch,
            contactConsistency: emailDomainMatch,
            evidence: compEvidence
          };
        })(),
        evidence: mlCred.evidence || [],
      };
    } catch (error) {
      logger.warn('ML credibility analysis failed', { error: (error as Error).message });
      credibilityAnalysis = {
        score: 0,
        website: { hasHttps: false, hasPrivacyPolicy: false, hasTerms: false, hasRefundPolicy: false, hasContactInfo: false, evidence: [{ claim: 'Website analysis', status: 'UNAVAILABLE' }] },
        company: { emailDomainMatch: false, applicationDomainMatch: false, contactConsistency: false, evidence: [{ claim: 'Company analysis', status: 'UNAVAILABLE' }] },
        evidence: [{ claim: 'Credibility analysis', status: 'UNAVAILABLE' }],
      };
    }

    try {
      const mlPayment = await mlClient.verifyPayment(extractedOpportunity);
      paymentVerification = {
        required: mlPayment.required,
        amount: mlPayment.amount,
        status: mlPayment.status as PaymentVerification['status'],
        confidence: mlPayment.confidence,
        evidence: mlPayment.evidence.map((e: any) => ({
          claim: e.claim || 'Payment analysis',
          status: e.status || 'UNAVAILABLE',
          details: e.details,
          observedAt: e.observedAt || new Date().toISOString()
        })),
      };
    } catch (error) {
      logger.warn('ML payment verification failed', { error: (error as Error).message });
      paymentVerification = {
        required: null,
        amount: null,
        status: 'UNKNOWN',
        confidence: 0,
        evidence: [{ claim: 'Payment verification', status: 'UNAVAILABLE' }],
      };
    }

    try {
      const mlSuitability = await mlClient.analyzeSuitability(extractedOpportunity, userProfile || {});
      suitabilityAnalysis = mlSuitability;
    } catch (error) {
      logger.warn('ML suitability analysis failed', { error: (error as Error).message });
      suitabilityAnalysis = {
        overallScore: null,
        breakdown: {
          skills: { score: null, status: 'UNAVAILABLE', reason: 'Service failed' },
          education: { score: null, status: 'UNAVAILABLE', reason: 'Service failed' },
          experience: { score: null, status: 'UNAVAILABLE', reason: 'Service failed' },
          careerGoals: { score: null, status: 'UNAVAILABLE', reason: 'Service failed' },
          compensation: { score: null, status: 'UNAVAILABLE', reason: 'Service failed' },
          location: { score: null, status: 'UNAVAILABLE', reason: 'Service failed' },
          budget: { score: null, status: 'UNAVAILABLE', reason: 'Service failed' },
        },
        skillGap: [],
        status: 'UNAVAILABLE',
      };
    }

    let altStatus: 'COMPLETED' | 'UNAVAILABLE' = 'COMPLETED';
    try {
      const mlAlternatives = await mlClient.findAlternatives(extractedOpportunity, userProfile || {});
      alternatives = mlAlternatives.alternatives;
    } catch (error) {
      logger.warn('ML alternatives failed', { error: (error as Error).message });
      alternatives = [];
      altStatus = 'UNAVAILABLE';
    }

    const valueAnalysis: ValueAnalysis = {
      score: null,
      potentialSaving: 0,
      alternatives,
      status: altStatus,
    };

    const recommendation = generateRecommendation(riskAnalysis, credibilityAnalysis, paymentVerification, suitabilityAnalysis);

    const evidenceLabels: Record<string, Evidence> = {};
    riskAnalysis.indicators.forEach((indicator) => {
      evidenceLabels[indicator.code] = createDefaultEvidence(indicator.explanation, indicator.evidence, indicator.details);
    });

    let accessKey: string | undefined;
    let accessKeyHash: string | undefined;

    if (!userId) {
      accessKey = crypto.randomBytes(32).toString('hex');
      accessKeyHash = crypto.createHash('sha256').update(accessKey).digest('hex');
    }

    const reportDoc = await Report.create({
      userId,
      accessKeyHash,
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
      ...(accessKey ? { accessToken: accessKey } : {}),
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
    const stipendMatches = text.match(/(?:stipend|salary|compensation)[:\s]*[₹$]\s?[\d,]+/gi) || [];
    const roleData = this.extractRole(text);

    return {
      type: roleData.type as any,
      organization: {
        name: this.extractOrgName(text, emails),
        email: emails[0],
        website: urls[0],
      },
      role: roleData.role,
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

  private extractRole(text: string): { role: string; type: string } {
    const roleKeywords = ['intern', 'developer', 'engineer', 'analyst', 'manager', 'trainee', 'associate', 'specialist'];
    const sentences = text.split(/(?<=[.!?\n])/).map(s => s.trim()).filter(Boolean);

    for (const s of sentences) {
      const sLower = s.toLowerCase();
      if (roleKeywords.some(k => sLower.includes(k))) {
        return {
          role: s,
          type: sLower.includes('intern') ? 'INTERNSHIP' : 'JOB'
        };
      }
    }
    return { role: 'Not specified', type: 'OTHER' };
  }
  private extractFees(text: string): any {
    const fees: any = {};
    const feePatterns = [
      { key: 'registration', patterns: ['registration fee', 'registration amount', 'register', 'registration'] },
      { key: 'processing', patterns: ['processing fee', 'processing charge'] },
      { key: 'securityDeposit', patterns: ['security deposit', 'deposit'] },
      { key: 'placement', patterns: ['placement fee', 'placement charge'] },
      { key: 'certificate', patterns: ['certificate fee', 'certification fee'] },
      { key: 'training', patterns: ['training fee', 'course fee', 'program fee', 'training'] },
    ];

    const lowerText = text.toLowerCase();
    const amountRegex = /[₹$]\s?([\d,]+)/g;

    for (const { key, patterns } of feePatterns) {
      for (const pattern of patterns) {
        if (lowerText.includes(pattern)) {
          const match = text.match(/([₹$]\s?[\d,]+)/);
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
    const stipendMatch = text.match(/(?:stipend|salary|compensation)[:\s]*[₹$]\s?([\d,]+)/i);
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
        evidence: 'SUPPORTED' as EvidenceStatus,
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
        evidence: 'SUPPORTED' as EvidenceStatus,
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
        evidence: 'SUPPORTED' as EvidenceStatus,
      });
      totalScore += RISK_WEIGHTS.SENSITIVE_INFO_REQUEST;
    }

    if (opportunity.stipend && opportunity.stipend.amount && opportunity.stipend.amount > 100000) {
      indicators.push({
        code: 'UNREALISTIC_COMPENSATION',
        title: 'Unrealistic compensation',
        explanation: 'The claimed compensation is unusually high for the role type',
        points: RISK_WEIGHTS.UNREALISTIC_COMPENSATION,
        evidence: 'INFERRED' as EvidenceStatus,
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
        evidence: 'SUPPORTED' as EvidenceStatus,
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
          evidence: 'INFERRED' as EvidenceStatus,
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
          status: hasFees ? 'SUPPORTED' : 'UNAVAILABLE',
          details: hasFees ? `Fees detected: ${JSON.stringify(fees)}` : 'No payment mentioned',
          observedAt: new Date().toISOString(),
        },
      ],
    };
  }

  async getReportById(reportId: string, userId?: string, accessKey?: string): Promise<AnalysisReport | null> {
    let report = null;
    if (userId) {
      report = await Report.findOne({ _id: reportId, userId }).lean();
    }
    if (!report && accessKey) {
      const accessKeyHash = crypto.createHash('sha256').update(accessKey).digest('hex');
      report = await Report.findOne({ _id: reportId, userId: { $in: [null, undefined] }, accessKeyHash }).lean();
    }

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