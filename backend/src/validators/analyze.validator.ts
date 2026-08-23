import { z } from 'zod';

export const analyzeSchema = z.object({
  body: z.object({
    inputType: z.enum(['text', 'screenshot', 'pdf', 'url']),
    text: z.string().optional(),
    url: z.string().url().optional(),
    userProfile: z.object({
      education: z.array(z.string()).optional(),
      skills: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      careerGoals: z.array(z.string()).optional(),
      experience: z.array(z.string()).optional(),
      budget: z.number().min(0).optional(),
      availableTime: z.string().optional(),
      preferredLearningMode: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).optional(),
    }).optional(),
  }).refine(
    (data) => {
      if (data.inputType === 'text') return !!data.text && data.text.length > 0;
      if (data.inputType === 'url') return !!data.url && data.url.length > 0;
      return true;
    },
    {
      message: 'Text is required for text input type, URL is required for url input type',
      path: ['text'],
    }
  );

export const suitabilitySchema = z.object({
  body: z.object({
    opportunityId: z.string().optional(),
    opportunity: z.object({
      type: z.string().optional(),
      organization: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().url().optional(),
      }).optional(),
      role: z.string().optional(),
      description: z.string().optional(),
      fees: z.object({
        registration: z.number().optional(),
        processing: z.number().optional(),
        securityDeposit: z.number().optional(),
        placement: z.number().optional(),
        certificate: z.number().optional(),
        training: z.number().optional(),
        currency: z.string().optional(),
      }).optional(),
      stipend: z.object({
        amount: z.number().optional(),
        currency: z.string().optional(),
        period: z.enum(['month', 'week', 'year', 'one-time']).optional(),
      }).optional(),
      skills: z.array(z.string()).optional(),
      eligibility: z.array(z.string()).optional(),
      duration: z.string().optional(),
    }).optional(),
    userProfile: z.object({
      education: z.array(z.string()).optional(),
      skills: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      careerGoals: z.array(z.string()).optional(),
      experience: z.array(z.string()).optional(),
      budget: z.number().min(0).optional(),
      availableTime: z.string().optional(),
      preferredLearningMode: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).optional(),
    }),
  }).refine(
    (data) => data.opportunityId || data.opportunity,
    { message: 'Either opportunityId or opportunity must be provided', path: ['opportunity'] }
  );
});

export const skillGapSchema = z.object({
  body: z.object({
    opportunityId: z.string().optional(),
    requiredSkills: z.array(z.string()).min(1),
    userSkills: z.array(z.string()).optional(),
  }),
});

export const alternativesSchema = z.object({
  body: z.object({
    opportunityId: z.string().optional(),
    opportunity: z.object({
      type: z.string().optional(),
      role: z.string().optional(),
      description: z.string().optional(),
      skills: z.array(z.string()).optional(),
      fees: z.object({
        registration: z.number().optional(),
        training: z.number().optional(),
        currency: z.string().optional(),
      }).optional(),
    }).optional(),
    userProfile: z.object({
      budget: z.number().min(0).optional(),
      skills: z.array(z.string()).optional(),
      preferredLearningMode: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']).optional(),
    }).optional(),
    limit: z.number().min(1).max(50).default(10),
  }).refine(
    (data) => data.opportunityId || data.opportunity,
    { message: 'Either opportunityId or opportunity must be provided', path: ['opportunity'] }
  );
});

export const paymentVerifySchema = z.object({
  body: z.object({
    opportunityId: z.string().optional(),
    opportunity: z.object({
      fees: z.object({
        registration: z.number().optional(),
        processing: z.number().optional(),
        securityDeposit: z.number().optional(),
        placement: z.number().optional(),
        certificate: z.number().optional(),
        training: z.number().optional(),
        currency: z.string().optional(),
      }).optional(),
      organization: z.object({
        name: z.string().optional(),
        website: z.string().url().optional(),
        email: z.string().email().optional(),
      }).optional(),
      claimedBenefits: z.array(z.string()).optional(),
    }).optional(),
    claimedAmount: z.number().min(0).optional(),
    claimedPurpose: z.string().optional(),
  }).refine(
    (data) => data.opportunityId || data.opportunity,
    { message: 'Either opportunityId or opportunity must be provided', path: ['opportunity'] }
  );
});