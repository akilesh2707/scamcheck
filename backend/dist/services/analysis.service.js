"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisService = exports.AnalysisService = void 0;
const uuid_1 = require("uuid");
const mlClient_service_1 = require("./mlClient.service");
const Opportunity_1 = require("../models/Opportunity");
const Report_1 = require("../models/Report");
const logger_1 = require("../utils/logger");
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
function calculateRiskLevel(score) {
    if (score <= 20)
        return 'LOW';
    if (score <= 40)
        return 'MODERATE';
    if (score <= 60)
        return 'MEDIUM';
    if (score <= 80)
        return 'HIGH';
    return 'VERY_HIGH';
}
function generateRecommendation(risk, credibility, payment, suitability) {
    const reasons = [];
    const nextSteps = [];
    if (risk.level === 'VERY_HIGH' || risk.level === 'HIGH') {
        reasons.push('Multiple high-risk indicators detected');
        nextSteps.push('Do not proceed without thorough independent verification');
    }
    if (payment.required && payment.status === 'CONTRADICTED') {
        reasons.push('Payment information contradicts official sources');
        nextSteps.push('Do not make the requested payment');
    }
    if (payment.required && payment.status === 'UNKNOWN') {
        reasons.push('Upfront payment requested but could not be independently verified');
        nextSteps.push('Verify payment requirements through official channels');
    }
    if (risk.indicators.some((i) => i.code === 'URGENCY_PRESSURE')) {
        reasons.push('Urgency pressure tactics detected');
        nextSteps.push('Take time to research independently; legitimate opportunities rarely require immediate decisions');
    }
    if (risk.indicators.some((i) => i.code === 'SENSITIVE_INFO_REQUEST')) {
        reasons.push('Request for sensitive personal/financial information');
        nextSteps.push('Never share OTP, banking credentials, or unnecessary identity documents');
    }
    if (credibility.website.score !== undefined && credibility.website.score < 40) {
        reasons.push('Website credibility concerns');
        nextSteps.push('Verify the organization through its official website and contact channels');
    }
    if (reasons.length === 0) {
        if (risk.level === 'LOW' && credibility.website.score !== undefined && credibility.website.score > 70) {
            return {
                decision: 'SAFE_TO_EXPLORE',
                reasons: ['Low risk indicators', 'Credible website and organization'],
                nextSteps: ['Proceed with standard due diligence'],
            };
        }
        return {
            decision: 'VERIFY_FIRST',
            reasons: ['Some concerns identified but no critical red flags'],
            nextSteps: ['Verify organization details independently', 'Research reviews and testimonials'],
        };
    }
    if (risk.level === 'VERY_HIGH' || (payment.required && payment.status === 'CONTRADICTED')) {
        return {
            decision: 'AVOID_PAYMENT',
            reasons,
            nextSteps,
        };
    }
    return {
        decision: 'CAUTION',
        reasons,
        nextSteps,
    };
}
function createDefaultEvidence(claim, status, details) {
    return {
        claim,
        status,
        details,
        checkedAt: new Date().toISOString(),
    };
}
class AnalysisService {
    async analyzeText(text, userId) {
        logger_1.logger.info('Starting analysis', { textLength: text.length, userId });
        let extractedOpportunity;
        try {
            extractedOpportunity = await mlClient_service_1.mlClient.extractOpportunity(text);
            logger_1.logger.info('Opportunity extracted', { type: extractedOpportunity.type });
        }
        catch (error) {
            logger_1.logger.warn('ML extraction failed, using basic extraction', { error: error.message });
            extractedOpportunity = this.basicExtraction(text);
        }
        const opportunityDoc = await Opportunity_1.Opportunity.create({
            userId,
            inputType: 'text',
            originalText: text,
            extractedData: extractedOpportunity,
        });
        let riskAnalysis;
        let credibilityAnalysis;
        let paymentVerification;
        let suitabilityAnalysis;
        let alternatives = [];
        try {
            const mlRisk = await mlClient_service_1.mlClient.analyzeRisk(extractedOpportunity);
            riskAnalysis = {
                score: mlRisk.score,
                level: mlRisk.level,
                indicators: mlRisk.indicators,
                weights: RISK_WEIGHTS,
            };
        }
        catch (error) {
            logger_1.logger.warn('ML risk analysis failed, using local rules', { error: error.message });
            riskAnalysis = this.localRiskAnalysis(extractedOpportunity);
        }
        try {
            const mlCred = await mlClient_service_1.mlClient.analyzeCredibility(extractedOpportunity);
            credibilityAnalysis = {
                score: mlCred.score,
                website: mlCred.website,
                company: mlCred.company,
                evidence: mlCred.evidence.map((e) => createDefaultEvidence('', e)),
            };
        }
        catch (error) {
            logger_1.logger.warn('ML credibility analysis failed', { error: error.message });
            credibilityAnalysis = {
                website: { hasHttps: false, hasPrivacyPolicy: false, hasTerms: false, hasRefundPolicy: false, hasContactInfo: false, evidence: [] },
                company: { emailDomainMatch: false, applicationDomainMatch: false, contactConsistency: false, evidence: [] },
                evidence: [],
            };
        }
        try {
            const mlPayment = await mlClient_service_1.mlClient.verifyPayment(extractedOpportunity);
            paymentVerification = {
                required: mlPayment.required,
                amount: mlPayment.amount,
                status: mlPayment.status,
                confidence: mlPayment.confidence,
                evidence: mlPayment.evidence.map((e) => createDefaultEvidence('', e)),
            };
        }
        catch (error) {
            logger_1.logger.warn('ML payment verification failed', { error: error.message });
            paymentVerification = this.localPaymentVerification(extractedOpportunity);
        }
        try {
            const mlSuitability = await mlClient_service_1.mlClient.analyzeSuitability(extractedOpportunity, {});
            suitabilityAnalysis = mlSuitability;
        }
        catch (error) {
            logger_1.logger.warn('ML suitability analysis failed', { error: error.message });
            suitabilityAnalysis = {
                score: null,
                breakdown: {},
                skillGap: [],
                status: 'NOT_IMPLEMENTED',
            };
        }
        try {
            const mlAlternatives = await mlClient_service_1.mlClient.findAlternatives(extractedOpportunity, {});
            alternatives = mlAlternatives.alternatives;
        }
        catch (error) {
            logger_1.logger.warn('ML alternatives failed', { error: error.message });
            alternatives = [];
        }
        const valueAnalysis = {
            score: null,
            potentialSaving: 0,
            alternatives,
        };
        const recommendation = generateRecommendation(riskAnalysis, credibilityAnalysis, paymentVerification, suitabilityAnalysis);
        const evidenceLabels = {};
        riskAnalysis.indicators.forEach((indicator) => {
            evidenceLabels[indicator.code] = createDefaultEvidence(indicator.explanation, indicator.evidence, indicator.details);
        });
        const report = {
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
            id: (0, uuid_1.v4)(),
        };
        await Report_1.Report.create({
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
        logger_1.logger.info('Analysis complete', { reportId: report.id, riskLevel: riskAnalysis.level });
        return report;
    }
    basicExtraction(text) {
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
    extractOrgName(text, emails) {
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.toLowerCase().includes('company') || line.toLowerCase().includes('organization')) {
                const afterColon = line.split(':')[1];
                if (afterColon)
                    return afterColon.trim();
            }
        }
        if (emails[0]) {
            const domain = emails[0].split('@')[1];
            return domain.split('.')[0];
        }
        return 'Unknown Organization';
    }
    extractRole(text) {
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
    extractFees(text) {
        const fees = {};
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
    extractStipend(text) {
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
    localRiskAnalysis(opportunity) {
        const indicators = [];
        let totalScore = 0;
        const text = (opportunity.rawText || '').toLowerCase();
        const orgName = opportunity.organization?.name?.toLowerCase() || '';
        const orgEmail = opportunity.organization?.email?.toLowerCase() || '';
        const orgWebsite = opportunity.organization?.website?.toLowerCase() || '';
        if (opportunity.fees && Object.keys(opportunity.fees).some(k => opportunity.fees[k] > 0)) {
            indicators.push({
                code: 'PAYMENT_REQUEST',
                title: 'Payment requested',
                explanation: 'The opportunity requests an upfront payment',
                points: RISK_WEIGHTS.PAYMENT_REQUEST,
                evidence: 'VERIFIED',
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
                evidence: 'VERIFIED',
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
                evidence: 'VERIFIED',
            });
            totalScore += RISK_WEIGHTS.SENSITIVE_INFO_REQUEST;
        }
        if (opportunity.stipend && opportunity.stipend.amount && opportunity.stipend.amount > 100000) {
            indicators.push({
                code: 'UNREALISTIC_COMPENSATION',
                title: 'Unrealistic compensation',
                explanation: 'The claimed compensation is unusually high for the role type',
                points: RISK_WEIGHTS.UNREALISTIC_COMPENSATION,
                evidence: 'LIKELY',
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
                evidence: 'VERIFIED',
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
                    evidence: 'LIKELY',
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
    localPaymentVerification(opportunity) {
        const fees = opportunity.fees;
        const hasFees = fees && Object.values(fees).some(v => v > 0);
        const totalFees = hasFees ? Object.values(fees).reduce((a, b) => a + b, 0) : 0;
        return {
            required: hasFees ?? false,
            amount: hasFees ? totalFees : null,
            status: 'NOT_FOUND',
            confidence: 0.5,
            evidence: [
                {
                    claim: 'Payment requirement',
                    status: hasFees ? 'VERIFIED' : 'NOT_FOUND',
                    details: hasFees ? `Fees detected: ${JSON.stringify(fees)}` : 'No payment mentioned',
                    checkedAt: new Date().toISOString(),
                },
            ],
        };
    }
    async getReportById(reportId) {
        const report = await Report_1.Report.findById(reportId).lean();
        if (!report)
            return null;
        return {
            opportunity: report.normalizedOpportunity,
            risk: report.riskAnalysis,
            credibility: report.credibilityAnalysis,
            payment: report.paymentVerification,
            suitability: report.suitabilityAnalysis,
            alternatives: report.alternatives,
            value: report.valueAnalysis,
            recommendation: report.recommendation,
            evidenceLabels: report.evidenceLabels,
            createdAt: report.createdAt.toISOString(),
            id: report._id.toString(),
        };
    }
    async getHistory(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [reports, total] = await Promise.all([
            Report_1.Report.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Report_1.Report.countDocuments({ userId }),
        ]);
        return {
            reports: reports.map(r => ({
                opportunity: r.normalizedOpportunity,
                risk: r.riskAnalysis,
                credibility: r.credibilityAnalysis,
                payment: r.paymentVerification,
                suitability: r.suitabilityAnalysis,
                alternatives: r.alternatives,
                value: r.valueAnalysis,
                recommendation: r.recommendation,
                evidenceLabels: r.evidenceLabels,
                createdAt: r.createdAt.toISOString(),
                id: r._id.toString(),
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
}
exports.AnalysisService = AnalysisService;
exports.analysisService = new AnalysisService();
//# sourceMappingURL=analysis.service.js.map