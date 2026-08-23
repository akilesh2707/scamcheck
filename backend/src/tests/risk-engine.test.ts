import { analyzeOpportunityRisk } from '../services/risk-engine';
import { ExtractedOpportunity } from '../types/opportunity';
import { RiskLevel } from '../types/report';

const mockOpportunity = (overrides: Partial<ExtractedOpportunity> = {}): ExtractedOpportunity => ({
  type: 'INTERNSHIP',
  organization: { name: 'XYZ Technologies', email: 'hr@xyz.com', website: 'https://xyz.com' },
  role: 'Software Developer Intern',
  description: 'Join our team as a software developer intern',
  fees: {},
  stipend: { amount: 20000, currency: 'INR', period: 'month' },
  duration: '3 months',
  contacts: [{ email: 'hr@xyz.com' }],
  urls: ['https://xyz.com/careers'],
  eligibility: ['Currently enrolled in CS degree'],
  skills: ['JavaScript', 'React', 'Node.js'],
  claimedBenefits: ['Mentorship', 'Certificate'],
  deadlines: ['2024-12-31'],
  claims: [],
  rawText: '',
  ...overrides,
});

describe('Risk Engine', () => {
  describe('Payment Request Detection', () => {
    it('should detect registration fee', () => {
      const opportunity = mockOpportunity({
        fees: { registration: 2999 },
        rawText: 'Pay ₹2,999 registration fee to confirm your position.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const paymentIndicator = result.indicators.find((i: any) => i.code === 'PAYMENT_REQUEST');
      expect(paymentIndicator).toBeDefined();
      expect(paymentIndicator?.points).toBe(30);
      expect(paymentIndicator?.evidence).toBe('VERIFIED');
    });

    it('should detect processing fee', () => {
      const opportunity = mockOpportunity({
        fees: { processing: 500 },
        rawText: 'Processing fee of ₹500 applies.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const paymentIndicator = result.indicators.find((i: any) => i.code === 'PAYMENT_REQUEST');
      expect(paymentIndicator).toBeDefined();
    });

    it('should detect security deposit', () => {
      const opportunity = mockOpportunity({
        fees: { securityDeposit: 10000 },
        rawText: 'Security deposit of ₹10,000 required.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const paymentIndicator = result.indicators.find((i: any) => i.code === 'PAYMENT_REQUEST');
      expect(paymentIndicator).toBeDefined();
    });

    it('should detect placement fee', () => {
      const opportunity = mockOpportunity({
        fees: { placement: 15000 },
        rawText: 'Placement fee of ₹15,000 after selection.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const paymentIndicator = result.indicators.find((i: any) => i.code === 'PAYMENT_REQUEST');
      expect(paymentIndicator).toBeDefined();
    });

    it('should detect certificate fee', () => {
      const opportunity = mockOpportunity({
        fees: { certificate: 2000 },
        rawText: 'Certificate fee ₹2,000.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const paymentIndicator = result.indicators.find((i: any) => i.code === 'PAYMENT_REQUEST');
      expect(paymentIndicator).toBeDefined();
    });

    it('should detect training fee', () => {
      const opportunity = mockOpportunity({
        fees: { training: 5000 },
        rawText: 'Training fee ₹5,000 for the program.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const paymentIndicator = result.indicators.find((i: any) => i.code === 'PAYMENT_REQUEST');
      expect(paymentIndicator).toBeDefined();
    });
  });

  describe('Urgency Pressure Detection', () => {
    it('should detect "limited seats"', () => {
      const opportunity = mockOpportunity({
        rawText: 'Only 3 seats remain. Apply now!',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const urgencyIndicator = result.indicators.find((i: any) => i.code === 'URGENCY_PRESSURE');
      expect(urgencyIndicator).toBeDefined();
      expect(urgencyIndicator?.points).toBe(25);
    });

    it('should detect "act now"', () => {
      const opportunity = mockOpportunity({
        rawText: 'Act now! This opportunity expires today.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const urgencyIndicator = result.indicators.find((i: any) => i.code === 'URGENCY_PRESSURE');
      expect(urgencyIndicator).toBeDefined();
    });

    it('should detect "expires today"', () => {
      const opportunity = mockOpportunity({
        rawText: 'Offer expires today. Last chance to apply.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const urgencyIndicator = result.indicators.find((i: any) => i.code === 'URGENCY_PRESSURE');
      expect(urgencyIndicator).toBeDefined();
    });

    it('should detect "pay immediately"', () => {
      const opportunity = mockOpportunity({
        rawText: 'Pay immediately to secure your spot.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const urgencyIndicator = result.indicators.find((i: any) => i.code === 'URGENCY_PRESSURE');
      expect(urgencyIndicator).toBeDefined();
    });

    it('should detect "last chance"', () => {
      const opportunity = mockOpportunity({
        rawText: 'Last chance! Only few seats left.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const urgencyIndicator = result.indicators.find((i: any) => i.code === 'URGENCY_PRESSURE');
      expect(urgencyIndicator).toBeDefined();
    });
  });

  describe('Sensitive Information Request Detection', () => {
    it('should detect OTP request', () => {
      const opportunity = mockOpportunity({
        rawText: 'Please share your OTP for verification.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const sensitiveIndicator = result.indicators.find((i: any) => i.code === 'SENSITIVE_INFO_REQUEST');
      expect(sensitiveIndicator).toBeDefined();
      expect(sensitiveIndicator?.points).toBe(35);
    });

    it('should detect CVV request', () => {
      const opportunity = mockOpportunity({
        rawText: 'We need your CVV for payment processing.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const sensitiveIndicator = result.indicators.find((i: any) => i.code === 'SENSITIVE_INFO_REQUEST');
      expect(sensitiveIndicator).toBeDefined();
    });

    it('should detect banking PIN request', () => {
      const opportunity = mockOpportunity({
        rawText: 'Provide your banking PIN to proceed.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const sensitiveIndicator = result.indicators.find((i: any) => i.code === 'SENSITIVE_INFO_REQUEST');
      expect(sensitiveIndicator).toBeDefined();
    });

    it('should detect password request', () => {
      const opportunity = mockOpportunity({
        rawText: 'Send your password for account setup.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const sensitiveIndicator = result.indicators.find((i: any) => i.code === 'SENSITIVE_INFO_REQUEST');
      expect(sensitiveIndicator).toBeDefined();
    });

    it('should detect bank account request', () => {
      const opportunity = mockOpportunity({
        rawText: 'Share your bank account details for stipend transfer.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const sensitiveIndicator = result.indicators.find((i: any) => i.code === 'SENSITIVE_INFO_REQUEST');
      expect(sensitiveIndicator).toBeDefined();
    });
  });

  describe('Unrealistic Compensation Detection', () => {
    it('should detect stipend over 100,000', () => {
      const opportunity = mockOpportunity({
        stipend: { amount: 150000, currency: 'INR', period: 'month' },
        rawText: 'Stipend: ₹1,50,000/month for internship.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const compIndicator = result.indicators.find((i: any) => i.code === 'UNREALISTIC_COMPENSATION');
      expect(compIndicator).toBeDefined();
      expect(compIndicator?.points).toBe(20);
      expect(compIndicator?.evidence).toBe('LIKELY');
    });

    it('should not flag reasonable stipend', () => {
      const opportunity = mockOpportunity({
        stipend: { amount: 30000, currency: 'INR', period: 'month' },
        rawText: 'Stipend: ₹30,000/month.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const compIndicator = result.indicators.find((i: any) => i.code === 'UNREALISTIC_COMPENSATION');
      expect(compIndicator).toBeUndefined();
    });
  });

  describe('Guaranteed Placement Detection', () => {
    it('should detect "guaranteed job"', () => {
      const opportunity = mockOpportunity({
        rawText: 'We offer guaranteed job placement after completion.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const guaranteeIndicator = result.indicators.find((i: any) => i.code === 'GUARANTEED_PLACEMENT');
      expect(guaranteeIndicator).toBeDefined();
      expect(guaranteeIndicator?.points).toBe(30);
    });

    it('should detect "guaranteed placement"', () => {
      const opportunity = mockOpportunity({
        rawText: '100% guaranteed placement for all students.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const guaranteeIndicator = result.indicators.find((i: any) => i.code === 'GUARANTEED_PLACEMENT');
      expect(guaranteeIndicator).toBeDefined();
    });

    it('should detect "guaranteed income"', () => {
      const opportunity = mockOpportunity({
        rawText: 'Guaranteed income of ₹50,000/month.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const guaranteeIndicator = result.indicators.find((i: any) => i.code === 'GUARANTEED_PLACEMENT');
      expect(guaranteeIndicator).toBeDefined();
    });
  });

  describe('Identity Mismatch Detection', () => {
    it('should detect email/domain mismatch', () => {
      const opportunity = mockOpportunity({
        organization: { name: 'XYZ Corp', email: 'hr@xyzcorp.com', website: 'https://different-domain.com' },
        rawText: 'Contact hr@xyzcorp.com for more info.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const mismatchIndicator = result.indicators.find((i: any) => i.code === 'IDENTITY_MISMATCH');
      expect(mismatchIndicator).toBeDefined();
      expect(mismatchIndicator?.points).toBe(15);
    });

    it('should not flag Gmail for unknown company', () => {
      const opportunity = mockOpportunity({
        organization: { name: 'New Startup', email: 'hr@gmail.com', website: 'https://newstartup.com' },
        rawText: 'Contact hr@gmail.com.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const mismatchIndicator = result.indicators.find((i: any) => i.code === 'IDENTITY_MISMATCH');
      expect(mismatchIndicator).toBeUndefined();
    });
  });

  describe('Suspicious Claims Detection', () => {
    it('should detect "easy money"', () => {
      const opportunity = mockOpportunity({
        rawText: 'Make easy money from home with no experience needed.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const suspiciousIndicator = result.indicators.find((i: any) => i.code === 'SUSPICIOUS_CLAIMS');
      expect(suspiciousIndicator).toBeDefined();
      expect(suspiciousIndicator?.points).toBe(20);
    });

    it('should detect "get rich quick"', () => {
      const opportunity = mockOpportunity({
        rawText: 'Get rich quick with our program.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const suspiciousIndicator = result.indicators.find((i: any) => i.code === 'SUSPICIOUS_CLAIMS');
      expect(suspiciousIndicator).toBeDefined();
    });
  });

  describe('Multiple Simultaneous Signals', () => {
    it('should accumulate score for multiple indicators', () => {
      const opportunity = mockOpportunity({
        fees: { registration: 2999 },
        stipend: { amount: 150000, currency: 'INR', period: 'month' },
        rawText: 'Congratulations! You have been selected. Pay ₹2,999 registration fee today. Only 3 seats remain. Stipend ₹1,50,000/month. Guaranteed job placement. Contact hr.xyz@gmail.com',
        organization: { name: 'XYZ', email: 'hr.xyz@gmail.com', website: 'https://xyz.com' },
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      expect(result.score).toBeGreaterThan(80);
      expect(result.level).toBe('VERY_HIGH');
      expect(result.indicators.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Missing Information', () => {
    it('should handle missing fees gracefully', () => {
      const opportunity = mockOpportunity({
        fees: undefined,
        rawText: 'Great opportunity with no fees.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const paymentIndicator = result.indicators.find((i: any) => i.code === 'PAYMENT_REQUEST');
      expect(paymentIndicator).toBeUndefined();
    });

    it('should handle missing stipend gracefully', () => {
      const opportunity = mockOpportunity({
        stipend: undefined,
        rawText: 'Volunteer position with no stipend.',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      const compIndicator = result.indicators.find((i: any) => i.code === 'UNREALISTIC_COMPENSATION');
      expect(compIndicator).toBeUndefined();
    });

    it('should handle empty rawText', () => {
      const opportunity = mockOpportunity({
        rawText: '',
      });
      const result = analyzeOpportunityRisk(opportunity);
      
      expect(result.score).toBe(0);
      expect(result.level).toBe('LOW');
    });
  });
});