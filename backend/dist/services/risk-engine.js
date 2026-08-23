"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeOpportunityRisk = analyzeOpportunityRisk;
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
const URGENCY_PATTERNS = [
    'limited seats', 'act now', 'expires today', 'pay immediately',
    'last chance', 'hurry', 'deadline', 'only', 'seats left', 'few seats',
    'limited time', 'offer ends', 'closing soon', 'urgent'
];
const SENSITIVE_PATTERNS = [
    'otp', 'cvv', 'pin', 'password', 'bank account', 'credit card',
    'debit card', 'banking credentials', 'bank details', 'account number',
    'routing number', 'sort code', 'iban', 'swift'
];
const GUARANTEE_PATTERNS = [
    'guaranteed job', 'guaranteed placement', 'guaranteed income',
    '100% placement', 'assured job', 'job guarantee', 'placement guarantee'
];
const SUSPICIOUS_CLAIMS = [
    'easy money', 'get rich quick', 'no experience needed', 'work from home',
    'make money fast', 'passive income', 'financial freedom'
];
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
function analyzeOpportunityRisk(opportunity) {
    const indicators = [];
    let totalScore = 0;
    const text = (opportunity.rawText || '').toLowerCase();
    const orgName = (opportunity.organization?.name || '').toLowerCase();
    const orgEmail = (opportunity.organization?.email || '').toLowerCase();
    const orgWebsite = (opportunity.organization?.website || '').toLowerCase();
    const fees = opportunity.fees || {};
    const hasFees = Object.values(fees).some(v => typeof v === 'number' && v > 0);
    if (hasFees) {
        indicators.push({
            code: 'PAYMENT_REQUEST',
            title: 'Payment requested',
            explanation: 'The opportunity requests an upfront payment',
            points: RISK_WEIGHTS.PAYMENT_REQUEST,
            evidence: 'VERIFIED',
            details: `Fees found: ${JSON.stringify(fees)}`,
        });
        totalScore += RISK_WEIGHTS.PAYMENT_REQUEST;
    }
    if (URGENCY_PATTERNS.some(pattern => text.includes(pattern))) {
        indicators.push({
            code: 'URGENCY_PRESSURE',
            title: 'Urgency pressure',
            explanation: 'The opportunity uses urgency language to pressure quick decisions',
            points: RISK_WEIGHTS.URGENCY_PRESSURE,
            evidence: 'VERIFIED',
        });
        totalScore += RISK_WEIGHTS.URGENCY_PRESSURE;
    }
    if (SENSITIVE_PATTERNS.some(pattern => text.includes(pattern))) {
        indicators.push({
            code: 'SENSITIVE_INFO_REQUEST',
            title: 'Sensitive information requested',
            explanation: 'The opportunity requests sensitive personal or financial information',
            points: RISK_WEIGHTS.SENSITIVE_INFO_REQUEST,
            evidence: 'VERIFIED',
        });
        totalScore += RISK_WEIGHTS.SENSITIVE_INFO_REQUEST;
    }
    const stipend = opportunity.stipend || {};
    if (stipend.amount && stipend.amount > 100000) {
        indicators.push({
            code: 'UNREALISTIC_COMPENSATION',
            title: 'Unrealistic compensation',
            explanation: 'The claimed compensation is unusually high for the role type',
            points: RISK_WEIGHTS.UNREALISTIC_COMPENSATION,
            evidence: 'LIKELY',
        });
        totalScore += RISK_WEIGHTS.UNREALISTIC_COMPENSATION;
    }
    if (GUARANTEE_PATTERNS.some(pattern => text.includes(pattern))) {
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
        const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
        if (emailDomain && orgDomain && !orgDomain.includes(emailDomain) && !commonDomains.includes(emailDomain)) {
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
    if (SUSPICIOUS_CLAIMS.some(pattern => text.includes(pattern))) {
        indicators.push({
            code: 'SUSPICIOUS_CLAIMS',
            title: 'Suspicious claims',
            explanation: 'The opportunity makes claims commonly associated with scams',
            points: RISK_WEIGHTS.SUSPICIOUS_CLAIMS,
            evidence: 'LIKELY',
        });
        totalScore += RISK_WEIGHTS.SUSPICIOUS_CLAIMS;
    }
    const finalScore = Math.min(totalScore, 100);
    const level = calculateRiskLevel(finalScore);
    return {
        score: finalScore,
        level,
        indicators,
        weights: RISK_WEIGHTS,
    };
}
//# sourceMappingURL=risk-engine.js.map